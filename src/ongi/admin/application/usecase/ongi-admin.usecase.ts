import { Inject, Injectable } from '@nestjs/common';
import {
  IOngiAdminRepository,
  ONGI_ADMIN_REPOSITORY,
  OngiAdminAccessLogRow,
  OngiAdminDashboardTotals,
  OngiAdminGroupMemberRow,
  OngiAdminGroupRow,
  OngiAdminPhotoRow,
  OngiAdminReportRow,
  OngiAdminUserGroupRow,
  OngiAdminUserRow,
} from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';
import {
  canGrantUserType,
  fillDailySeries,
  hasAdminPermission,
  isValidAdminConfig,
  maskEmail,
  ONGI_ADMIN_CONFIG_KEYS,
  OngiAdminPermission,
  OngiAdminType,
} from '@/ongi/admin/domain/service/ongi-admin-policy';
import {
  OngiAdminInvalidConfig,
  OngiAdminInvalidGrant,
  OngiAdminNotFound,
  OngiAdminUnsupportedTarget,
} from '@/ongi/admin/domain/exception/ongi-admin.exception';
import { OngiAdminActor } from '@/ongi/admin/presentation/guard/ongi-admin.guard';
import { IOngiPhotoRepository, ONGI_PHOTO_REPOSITORY } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { ONGI_REPORT_STATUS, ONGI_REPORT_TARGET_TYPE } from '@/ongi/report/domain/entity/ongi-report.entity';
import { OngiGetAppConfigUseCase } from '@/ongi/config/application/usecase/ongi-config.usecase';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';

const PAGE_SIZE = 50;
const SIGNUP_DAYS = 14;

const pageOf = (page: number) => ({ limit: PAGE_SIZE, offset: Math.max(0, page - 1) * PAGE_SIZE });

/** 민감 정보 권한이 없으면 이메일은 가리고 SNS 종류는 숨긴다 */
function redactUser(type: OngiAdminType, user: OngiAdminUserRow): OngiAdminUserRow {
  if (hasAdminPermission(type, 'sensitive')) return user;

  return { ...user, email: maskEmail(user.email), snsType: null };
}

export interface OngiAdminMeView {
  userId: number;
  name: string;
  type: OngiAdminType;
  permissions: OngiAdminPermission[];
}

@Injectable()
export class OngiAdminMeUseCase {
  constructor(
    @Inject(ONGI_ADMIN_REPOSITORY)
    private readonly adminRepository: IOngiAdminRepository,
  ) {}

  async execute(actor: OngiAdminActor): Promise<OngiAdminMeView> {
    const user = await this.adminRepository.findUserTypeById(actor.userId);
    const all: OngiAdminPermission[] = ['dashboard', 'reports', 'directory', 'configs', 'grant', 'sensitive', 'photos'];

    return { userId: actor.userId, name: user?.name ?? '', type: actor.type, permissions: all.filter(p => hasAdminPermission(actor.type, p)) };
  }
}

@Injectable()
export class OngiAdminDashboardUseCase {
  constructor(
    @Inject(ONGI_ADMIN_REPOSITORY)
    private readonly adminRepository: IOngiAdminRepository,
  ) {}

  async execute(): Promise<{ totals: OngiAdminDashboardTotals; signups: { day: string; count: number }[] }> {
    const [totals, rows, todayKey] = await Promise.all([
      this.adminRepository.getDashboardTotals(),
      this.adminRepository.scanDailySignups(SIGNUP_DAYS),
      this.adminRepository.todayKey(),
    ]);

    return { totals, signups: fillDailySeries(rows, todayKey, SIGNUP_DAYS) };
  }
}

@Injectable()
export class OngiAdminReportUseCase {
  constructor(
    @Inject(ONGI_ADMIN_REPOSITORY)
    private readonly adminRepository: IOngiAdminRepository,

    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  scan(status: string | null, page: number): Promise<OngiAdminReportRow[]> {
    const filter = status === ONGI_REPORT_STATUS.OPEN || status === ONGI_REPORT_STATUS.RESOLVED ? status : null;

    return this.adminRepository.scanReports(filter, pageOf(page));
  }

  async setStatus(reportId: number, status: string): Promise<void> {
    const report = await this.adminRepository.findReportById(reportId);
    if (!report) throw new OngiAdminNotFound();

    await this.adminRepository.updateReportStatus(reportId, status === ONGI_REPORT_STATUS.RESOLVED ? ONGI_REPORT_STATUS.RESOLVED : ONGI_REPORT_STATUS.OPEN);
  }

  /** 신고된 사진·댓글 삭제 후 처리 완료 — 사진은 다른 게시물이 쓰지 않는 파일이면 S3 원본도 지운다 */
  async removeTarget(reportId: number): Promise<void> {
    const report = await this.adminRepository.findReportById(reportId);
    if (!report) throw new OngiAdminNotFound();

    if (report.targetType === ONGI_REPORT_TARGET_TYPE.PHOTO) {
      const photo = await this.photoRepository.findById(report.targetId);
      if (photo) {
        await this.photoRepository.softDeletePhoto(photo.id);
        if ((await this.photoRepository.countActiveByUrl(photo.url)) === 0) {
          await this.awsS3Service.deleteByUrls(photo.thumbUrl ? [photo.url, photo.thumbUrl] : [photo.url]);
        }
      }
    } else if (report.targetType === ONGI_REPORT_TARGET_TYPE.COMMENT) {
      const comment = await this.photoRepository.findCommentById(report.targetId);
      if (comment) await this.photoRepository.softDeleteComment(comment.id, comment.photoId);
    } else {
      throw new OngiAdminUnsupportedTarget();
    }

    await this.adminRepository.updateReportStatus(reportId, ONGI_REPORT_STATUS.RESOLVED);
  }
}

@Injectable()
export class OngiAdminDirectoryUseCase {
  constructor(
    @Inject(ONGI_ADMIN_REPOSITORY)
    private readonly adminRepository: IOngiAdminRepository,
  ) {}

  async scanUsers(actor: OngiAdminActor, query: string | null, page: number) {
    const users = await this.adminRepository.scanUsers(query, hasAdminPermission(actor.type, 'sensitive'), pageOf(page));

    return users.map(user => redactUser(actor.type, user));
  }

  async getUser(actor: OngiAdminActor, userId: number): Promise<{ user: OngiAdminUserRow; groups: OngiAdminUserGroupRow[] }> {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) throw new OngiAdminNotFound();

    return { user: redactUser(actor.type, user), groups: await this.adminRepository.scanUserGroups(userId) };
  }

  async grantType(actor: OngiAdminActor, userId: number, nextType: string): Promise<void> {
    const user = await this.adminRepository.findUserById(userId);
    if (!user || user.deletedAt) throw new OngiAdminNotFound();
    if (!canGrantUserType({ actorUserId: actor.userId, targetUserId: userId, targetCurrentType: user.type, nextType })) throw new OngiAdminInvalidGrant();

    await this.adminRepository.updateUserType(userId, nextType);
  }

  scanGroups(query: string | null, page: number): Promise<OngiAdminGroupRow[]> {
    return this.adminRepository.scanGroups(query, pageOf(page));
  }

  async getGroup(groupId: number): Promise<{ group: OngiAdminGroupRow; members: OngiAdminGroupMemberRow[] }> {
    const group = await this.adminRepository.findGroupById(groupId);
    if (!group) throw new OngiAdminNotFound();

    return { group, members: await this.adminRepository.scanGroupMembers(groupId) };
  }
}

@Injectable()
export class OngiAdminConfigUseCase {
  constructor(
    @Inject(ONGI_ADMIN_REPOSITORY)
    private readonly adminRepository: IOngiAdminRepository,

    private readonly appConfigUseCase: OngiGetAppConfigUseCase,
  ) {}

  async scan(): Promise<{ key: string; value: string }[]> {
    const rows = await this.adminRepository.scanConfigs(ONGI_ADMIN_CONFIG_KEYS);
    const byKey = new Map(rows.map(row => [row.key, row.value]));

    return ONGI_ADMIN_CONFIG_KEYS.map(key => ({ key, value: byKey.get(key) ?? '1.0.0' }));
  }

  async update(key: string, value: string): Promise<void> {
    if (!isValidAdminConfig(key, value)) throw new OngiAdminInvalidConfig();

    await this.adminRepository.upsertConfig(key, value);
    this.appConfigUseCase.invalidate();
  }
}

/** 가족 사진 열람 — 대상이 있는지 확인하고, 조회할 때마다 열람 기록을 남긴다 */
@Injectable()
export class OngiAdminPhotoUseCase {
  constructor(
    @Inject(ONGI_ADMIN_REPOSITORY)
    private readonly adminRepository: IOngiAdminRepository,
  ) {}

  async scanGroupPhotos(actor: OngiAdminActor, groupId: number, page: number): Promise<OngiAdminPhotoRow[]> {
    if (!(await this.adminRepository.findGroupById(groupId))) throw new OngiAdminNotFound();

    await this.adminRepository.createAccessLog({ adminUserId: actor.userId, action: 'view_photos', targetType: 'group', targetId: groupId });

    return this.adminRepository.scanGroupPhotos(groupId, pageOf(page));
  }

  async scanUserPhotos(actor: OngiAdminActor, userId: number, page: number): Promise<OngiAdminPhotoRow[]> {
    if (!(await this.adminRepository.findUserById(userId))) throw new OngiAdminNotFound();

    await this.adminRepository.createAccessLog({ adminUserId: actor.userId, action: 'view_photos', targetType: 'user', targetId: userId });

    return this.adminRepository.scanUserPhotos(userId, pageOf(page));
  }

  scanAccessLogs(page: number): Promise<OngiAdminAccessLogRow[]> {
    return this.adminRepository.scanAccessLogs(pageOf(page));
  }
}
