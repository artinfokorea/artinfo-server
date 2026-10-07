import { Inject, Injectable } from '@nestjs/common';
import {
  IOngiAdminRepository,
  ONGI_ADMIN_REPOSITORY,
  OngiAdminAccessLogRow,
  OngiAdminDashboardTotals,
  OngiAdminFunnel,
  OngiAdminGroupMemberRow,
  OngiAdminGroupRow,
  OngiAdminInquiryRow,
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
  normalizeUserSort,
  ONGI_ADMIN_CONFIG_KEYS,
  OngiAdminPermission,
  OngiAdminType,
} from '@/ongi/admin/domain/service/ongi-admin-policy';
import {
  OngiAdminInvalidAnswer,
  OngiAdminInvalidConfig,
  OngiAdminInvalidGrant,
  OngiAdminNotFound,
  OngiAdminUnsupportedTarget,
} from '@/ongi/admin/domain/exception/ongi-admin.exception';
import {
  averageOf,
  buildRetention,
  buildRetentionByRole,
  buildRetentionCurve,
  buildStickiness,
  buildVisitDays,
  dayKeysUntil,
  OngiRetentionCurveView,
  OngiRetentionView,
  OngiRoleRetentionView,
  percentOf,
} from '@/ongi/admin/domain/service/ongi-admin-stats-policy';
import { OngiAdminActor } from '@/ongi/admin/presentation/guard/ongi-admin.guard';
import { IOngiPhotoRepository, ONGI_PHOTO_REPOSITORY } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { ONGI_REPORT_STATUS, ONGI_REPORT_TARGET_TYPE } from '@/ongi/report/domain/entity/ongi-report.entity';
import { OngiGetAppConfigUseCase } from '@/ongi/config/application/usecase/ongi-config.usecase';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { normalizeInquiryAnswer, shouldNotifyInquiryAnswer } from '@/ongi/inquiry/domain/service/ongi-inquiry-policy';
import { OngiPushService } from '@/ongi/push/application/service/ongi-push.service';

const PAGE_SIZE = 50;
const SIGNUP_DAYS = 14;
const STATS_DAYS = 30;
const ENGAGEMENT_DAYS = 7;
/** 0→1 목표 지표의 창 — 가입·공간 생성 후 이 안에 일어나야 활성화로 친다 */
const ACTIVATION_DAYS = 7;
const MIX_DAYS = 7;
/** 재방문 곡선은 가입 30일째까지 */
const CURVE_DAYS = 30;

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
    const all: OngiAdminPermission[] = ['dashboard', 'reports', 'inquiries', 'directory', 'configs', 'grant', 'sensitive', 'photos', 'deleteGroup'];

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

export interface OngiAdminStatsDailyView {
  day: string;
  activeUsers: number;
  measuredUsers: number;
  /** 시간을 잰 사용자 1명당 평균 사용 시간(초) */
  avgSeconds: number;
  sessions: number;
  signups: number;
  photos: number;
  comments: number;
  chatMessages: number;
}

export interface OngiAdminStatsView {
  today: string;
  trackingSince: string | null;
  active: { dau: number; wau: number; mau: number; stickiness: number };
  daily: OngiAdminStatsDailyView[];
  /** 최근 7일, 앱이 사용 시간을 보낸 사용자만 */
  engagement: { measuredUserDays: number; avgSecondsPerUser: number; avgSessionsPerUser: number; avgSecondsPerSession: number };
  retention: OngiRetentionView[];
  /** 재방문율을 역할로 나눠서 — 공간을 만든 사람 · 초대받은 사람 · 공간이 없는 사람 */
  retentionByRole: OngiRoleRetentionView[];
  /** 재방문 곡선 — 최근 30일 가입자가 가입 1~30일째에 다시 온 비율, 전체와 역할별 */
  retentionCurve: OngiRetentionCurveView;
  /** 7일 안 활성화 — 두 번째 가족 합류 · 첫 사진 */
  activation: {
    windowDays: number;
    secondMember: { cohort: number; count: number; rate: number };
    firstPhoto: { cohort: number; count: number; rate: number };
  };
  /** 최근 7일 접속자가 며칠 왔는지 — 1일부터 7일까지 */
  visitDays: { days: number; users: number }[];
  /** 최근 7일 접속자 = 신규 + 기존 + 부활 */
  activeMix: {
    total: number;
    newUsers: { count: number; rate: number };
    existing: { count: number; rate: number };
    resurrected: { count: number; rate: number };
  };
  spaces: { total: number; solo: number; soloRate: number; active7d: number; activeRate: number; avgMembers: number };
  funnel: { users: number } & Record<Exclude<keyof OngiAdminFunnel, 'users'>, { count: number; rate: number }>;
  platforms: { platform: string; users: number }[];
  versions: { version: string; users: number }[];
  /** 수치에서 뺀 테스트 계정 수 */
  excludedTestUsers: number;
}

@Injectable()
export class OngiAdminStatsUseCase {
  constructor(
    @Inject(ONGI_ADMIN_REPOSITORY)
    private readonly adminRepository: IOngiAdminRepository,
  ) {}

  async execute(): Promise<OngiAdminStatsView> {
    const [
      summary,
      activityRows,
      contentRows,
      retentionRows,
      spaces,
      funnel,
      platforms,
      versions,
      excludedTestUsers,
      roleRows,
      activation,
      visitRows,
      mix,
      curveRows,
    ] = await Promise.all([
      this.adminRepository.getActivitySummary(),
      this.adminRepository.scanDailyActivity(STATS_DAYS),
      this.adminRepository.scanDailyContent(STATS_DAYS),
      this.adminRepository.scanRetention(STATS_DAYS),
      this.adminRepository.getSpaceStats(),
      this.adminRepository.getFunnel(),
      this.adminRepository.scanPlatforms(STATS_DAYS),
      this.adminRepository.scanVersions(STATS_DAYS),
      this.adminRepository.countTestUsers(),
      this.adminRepository.scanRetentionByRole(STATS_DAYS),
      this.adminRepository.getActivation(STATS_DAYS, ACTIVATION_DAYS),
      this.adminRepository.scanVisitDays(MIX_DAYS),
      this.adminRepository.getActiveMix(MIX_DAYS),
      this.adminRepository.scanRetentionCurve(STATS_DAYS, CURVE_DAYS),
    ]);

    const activityOf = new Map(activityRows.map(row => [row.day, row]));
    const contentOf = new Map(contentRows.map(row => [row.day, row]));
    const daily = dayKeysUntil(summary.today, STATS_DAYS).map(day => {
      const activity = activityOf.get(day);
      const content = contentOf.get(day);

      return {
        day,
        activeUsers: activity?.activeUsers ?? 0,
        measuredUsers: activity?.measuredUsers ?? 0,
        avgSeconds: averageOf(activity?.seconds ?? 0, activity?.measuredUsers ?? 0),
        sessions: activity?.sessions ?? 0,
        signups: content?.signups ?? 0,
        photos: content?.photos ?? 0,
        comments: content?.comments ?? 0,
        chatMessages: content?.chatMessages ?? 0,
      };
    });

    const recent = dayKeysUntil(summary.today, ENGAGEMENT_DAYS).map(day => activityOf.get(day));
    const measuredUserDays = recent.reduce((sum, row) => sum + (row?.measuredUsers ?? 0), 0);
    const seconds = recent.reduce((sum, row) => sum + (row?.seconds ?? 0), 0);
    const sessions = recent.reduce((sum, row) => sum + (row?.sessions ?? 0), 0);
    const rateOfUsers = (count: number) => ({ count, rate: percentOf(count, funnel.users) });
    const mixTotal = mix.newUsers + mix.existing + mix.resurrected;
    const rateOfMix = (count: number) => ({ count, rate: percentOf(count, mixTotal) });

    return {
      today: summary.today,
      trackingSince: summary.trackingSince,
      active: { dau: summary.dau, wau: summary.wau, mau: summary.mau, stickiness: buildStickiness(daily, summary.mau, summary.trackingSince) },
      daily,
      engagement: {
        measuredUserDays,
        avgSecondsPerUser: averageOf(seconds, measuredUserDays),
        avgSessionsPerUser: averageOf(sessions, measuredUserDays, 1),
        avgSecondsPerSession: averageOf(seconds, sessions),
      },
      retention: buildRetention(retentionRows),
      retentionByRole: buildRetentionByRole(roleRows),
      retentionCurve: buildRetentionCurve(curveRows, CURVE_DAYS),
      activation: {
        windowDays: ACTIVATION_DAYS,
        secondMember: {
          cohort: activation.spaces,
          count: activation.spacesWithSecondMember,
          rate: percentOf(activation.spacesWithSecondMember, activation.spaces),
        },
        firstPhoto: { cohort: activation.users, count: activation.usersWithPhoto, rate: percentOf(activation.usersWithPhoto, activation.users) },
      },
      visitDays: buildVisitDays(visitRows, MIX_DAYS),
      activeMix: { total: mixTotal, newUsers: rateOfMix(mix.newUsers), existing: rateOfMix(mix.existing), resurrected: rateOfMix(mix.resurrected) },
      spaces: {
        total: spaces.total,
        solo: spaces.solo,
        soloRate: percentOf(spaces.solo, spaces.total),
        active7d: spaces.active7d,
        activeRate: percentOf(spaces.active7d, spaces.total),
        avgMembers: averageOf(spaces.members, spaces.total, 1),
      },
      funnel: {
        users: funnel.users,
        withGroup: rateOfUsers(funnel.withGroup),
        withPhoto: rateOfUsers(funnel.withPhoto),
        withChat: rateOfUsers(funnel.withChat),
        withPush: rateOfUsers(funnel.withPush),
      },
      platforms: platforms.map(row => ({ platform: row.platform ?? 'unknown', users: row.users })),
      versions: versions.map(row => ({ version: row.version ?? 'unknown', users: row.users })),
      excludedTestUsers,
    };
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

  async scanUsers(actor: OngiAdminActor, query: string | null, page: number, sort?: string) {
    const users = await this.adminRepository.scanUsers(query, hasAdminPermission(actor.type, 'sensitive'), pageOf(page), normalizeUserSort(sort));

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

  /** 테스트 계정 지정·해제 — 본인·탈퇴한 계정도 된다 (등급과 달리 권한이 아니라 수치에서 뺄지의 표시다) */
  async setTest(_actor: OngiAdminActor, userId: number, isTest: boolean): Promise<void> {
    if (!(await this.adminRepository.findUserById(userId))) throw new OngiAdminNotFound();

    await this.adminRepository.updateUserTest(userId, isTest);
  }

  scanGroups(query: string | null, page: number): Promise<OngiAdminGroupRow[]> {
    return this.adminRepository.scanGroups(query, pageOf(page));
  }

  async getGroup(groupId: number): Promise<{ group: OngiAdminGroupRow; members: OngiAdminGroupMemberRow[] }> {
    const group = await this.adminRepository.findGroupById(groupId);
    if (!group) throw new OngiAdminNotFound();

    return { group, members: await this.adminRepository.scanGroupMembers(groupId) };
  }

  /** 가족 공간 삭제 — 구성원·앨범·사진·댓글·일정까지 함께 소프트 삭제 (S3 원본은 남긴다) */
  async removeGroup(actor: OngiAdminActor, groupId: number): Promise<void> {
    if (!(await this.adminRepository.findGroupById(groupId))) throw new OngiAdminNotFound();

    await this.adminRepository.softDeleteGroup(groupId, actor.userId);
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

@Injectable()
export class OngiAdminInquiryUseCase {
  constructor(
    @Inject(ONGI_ADMIN_REPOSITORY)
    private readonly adminRepository: IOngiAdminRepository,

    private readonly pushService: OngiPushService,
  ) {}

  async scan(actor: OngiAdminActor, status: string | null, page: number): Promise<OngiAdminInquiryRow[]> {
    const filter = status === 'open' || status === 'answered' ? status : null;
    const rows = await this.adminRepository.scanInquiries(filter, pageOf(page));
    if (hasAdminPermission(actor.type, 'sensitive')) return rows;

    return rows.map(row => ({ ...row, userEmail: maskEmail(row.userEmail) }));
  }

  /**
   * 답변 저장 — 비워 두면 답변 없이 완료 처리(빈 문자열로 저장).
   * 푸시는 내용 있는 답변이 처음 달릴 때만 (답변 없이 완료·수정은 조용히 반영)
   */
  async answer(actor: OngiAdminActor, inquiryId: number, rawAnswer: string): Promise<void> {
    const answer = normalizeInquiryAnswer(rawAnswer);
    if (answer === null) throw new OngiAdminInvalidAnswer();

    const inquiry = await this.adminRepository.findInquiryById(inquiryId);
    if (!inquiry) throw new OngiAdminNotFound();

    await this.adminRepository.answerInquiry(inquiryId, answer, actor.userId);

    if (shouldNotifyInquiryAnswer(inquiry.answer, answer)) {
      this.pushService.notifyUsers([inquiry.userId], {
        title: '온기',
        body: '남겨주신 문의에 답변이 등록됐어요.',
        data: { type: 'inquiry_answered', inquiryId: String(inquiryId) },
      });
    }
  }
}
