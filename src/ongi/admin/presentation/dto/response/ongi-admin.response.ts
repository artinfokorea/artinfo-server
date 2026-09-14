import { ApiProperty } from '@nestjs/swagger';
import { signOngiMediaUrl } from '@/ongi/common/ongi-media-url';
import { OngiAdminMeView } from '@/ongi/admin/application/usecase/ongi-admin.usecase';
import {
  OngiAdminAccessLogRow,
  OngiAdminDashboardTotals,
  OngiAdminGroupMemberRow,
  OngiAdminGroupRow,
  OngiAdminPhotoRow,
  OngiAdminReportRow,
  OngiAdminUserGroupRow,
  OngiAdminUserRow,
} from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';

const iso = (date: Date | null) => (date ? new Date(date).toISOString() : null);

export class OngiAdminOkResponse {
  @ApiProperty({ type: Boolean })
  ok = true;
}

export class OngiAdminMeResponse {
  @ApiProperty({ type: String }) userId: string;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String, description: "'ADMIN' | 'SUPER_ADMIN'" }) type: string;
  @ApiProperty({ type: [String], description: 'dashboard · reports · directory · configs · grant · sensitive' }) permissions: string[];

  constructor(view: OngiAdminMeView) {
    this.userId = String(view.userId);
    this.name = view.name;
    this.type = view.type;
    this.permissions = view.permissions;
  }
}

export class OngiAdminDashboardResponse {
  @ApiProperty({ type: Object, description: '누적 수치' }) totals: OngiAdminDashboardTotals;
  @ApiProperty({ type: [Object], description: '최근 14일 일별 가입 수 (오래된 날부터)' }) signups: { day: string; count: number }[];

  constructor(view: { totals: OngiAdminDashboardTotals; signups: { day: string; count: number }[] }) {
    this.totals = view.totals;
    this.signups = view.signups;
  }
}

class OngiAdminReportItem {
  id: string;
  status: string;
  reason: string;
  createdAt: string;
  reporter: { userId: string; name: string | null };
  targetType: string;
  targetId: string;
  targetDeleted: boolean;
  targetName: string | null;
  targetUserId: string | null;
  group: { id: string; name: string } | null;
  photo: { id: string; url: string | null; thumbUrl: string | null; mediaType: string; caption: string | null } | null;
  commentText: string | null;

  constructor(row: OngiAdminReportRow) {
    this.id = String(row.id);
    this.status = row.status;
    this.reason = row.reason;
    this.createdAt = new Date(row.createdAt).toISOString();
    this.reporter = { userId: String(row.reporterUserId), name: row.reporterName };
    this.targetType = row.targetType;
    this.targetId = String(row.targetId);
    this.targetDeleted = row.targetDeleted;
    this.targetName = row.targetName;
    this.targetUserId = row.targetUserId === null ? null : String(row.targetUserId);
    this.group = row.groupId === null ? null : { id: String(row.groupId), name: row.groupName ?? '' };
    this.photo =
      row.photoId === null
        ? null
        : {
            id: String(row.photoId),
            url: signOngiMediaUrl(row.photoUrl),
            thumbUrl: signOngiMediaUrl(row.photoThumbUrl),
            mediaType: row.photoMediaType ?? 'photo',
            caption: row.photoCaption,
          };
    this.commentText = row.commentText;
  }
}

export class OngiAdminReportListResponse {
  @ApiProperty({ type: [Object], description: '신고 목록 (최근 순, 50개씩)' }) reports: OngiAdminReportItem[];

  constructor(rows: OngiAdminReportRow[]) {
    this.reports = rows.map(row => new OngiAdminReportItem(row));
  }
}

const userItem = (user: OngiAdminUserRow) => ({
  id: String(user.id),
  name: user.name,
  /** 민감 정보 권한이 없으면 가려진 값 */
  email: user.email,
  /** 민감 정보 권한이 없으면 null */
  snsType: user.snsType,
  type: user.type,
  createdAt: new Date(user.createdAt).toISOString(),
  deletedAt: iso(user.deletedAt),
  groupCount: user.groupCount,
  photoCount: user.photoCount,
});

export class OngiAdminUserListResponse {
  @ApiProperty({ type: [Object], description: '사용자 목록 (최근 가입 순, 50개씩)' }) users: ReturnType<typeof userItem>[];

  constructor(rows: OngiAdminUserRow[]) {
    this.users = rows.map(userItem);
  }
}

export class OngiAdminUserDetailResponse {
  @ApiProperty({ type: Object }) user: ReturnType<typeof userItem>;
  @ApiProperty({ type: [Object], description: '소속 가족 공간' }) groups: {
    groupId: string;
    groupName: string;
    memberName: string;
    role: string;
    joinedAt: string;
  }[];

  constructor(view: { user: OngiAdminUserRow; groups: OngiAdminUserGroupRow[] }) {
    this.user = userItem(view.user);
    this.groups = view.groups.map(group => ({
      groupId: String(group.groupId),
      groupName: group.groupName,
      memberName: group.memberName,
      role: group.role,
      joinedAt: new Date(group.joinedAt).toISOString(),
    }));
  }
}

const groupItem = (group: OngiAdminGroupRow) => ({
  id: String(group.id),
  name: group.name,
  createdAt: new Date(group.createdAt).toISOString(),
  memberCount: group.memberCount,
  photoCount: group.photoCount,
  lastPhotoAt: iso(group.lastPhotoAt),
});

export class OngiAdminGroupListResponse {
  @ApiProperty({ type: [Object], description: '가족 공간 목록 (최근 생성 순, 50개씩)' }) groups: ReturnType<typeof groupItem>[];

  constructor(rows: OngiAdminGroupRow[]) {
    this.groups = rows.map(groupItem);
  }
}

export class OngiAdminGroupDetailResponse {
  @ApiProperty({ type: Object }) group: ReturnType<typeof groupItem>;
  @ApiProperty({ type: [Object], description: '구성원' }) members: {
    memberId: string;
    userId: string;
    name: string;
    role: string;
    joinedAt: string;
    photoCount: number;
  }[];

  constructor(view: { group: OngiAdminGroupRow; members: OngiAdminGroupMemberRow[] }) {
    this.group = groupItem(view.group);
    this.members = view.members.map(member => ({
      memberId: String(member.memberId),
      userId: String(member.userId),
      name: member.name,
      role: member.role,
      joinedAt: new Date(member.joinedAt).toISOString(),
      photoCount: member.photoCount,
    }));
  }
}

export class OngiAdminConfigListResponse {
  @ApiProperty({ type: [Object], description: '앱 버전 설정' }) configs: { key: string; value: string }[];

  constructor(configs: { key: string; value: string }[]) {
    this.configs = configs;
  }
}

export class OngiAdminPhotoListResponse {
  @ApiProperty({ type: [Object], description: '사진·영상 (최신순, 50개씩) — URL 은 presigned' }) photos: {
    id: string;
    groupId: string;
    groupName: string;
    authorName: string | null;
    authorUserId: string | null;
    url: string;
    thumbUrl: string | null;
    mediaType: string;
    caption: string | null;
    createdAt: string;
  }[];

  constructor(rows: OngiAdminPhotoRow[]) {
    this.photos = rows.map(row => ({
      id: String(row.id),
      groupId: String(row.groupId),
      groupName: row.groupName,
      authorName: row.authorName,
      authorUserId: row.authorUserId === null ? null : String(row.authorUserId),
      url: signOngiMediaUrl(row.url),
      thumbUrl: signOngiMediaUrl(row.thumbUrl),
      mediaType: row.mediaType ?? 'photo',
      caption: row.caption,
      createdAt: new Date(row.createdAt).toISOString(),
    }));
  }
}

export class OngiAdminAccessLogListResponse {
  @ApiProperty({ type: [Object], description: '운영자 사진 열람 기록 (최신순, 50개씩)' }) logs: {
    id: string;
    adminUserId: string;
    adminName: string | null;
    action: string;
    targetType: string;
    targetId: string;
    targetName: string | null;
    createdAt: string;
  }[];

  constructor(rows: OngiAdminAccessLogRow[]) {
    this.logs = rows.map(row => ({
      id: String(row.id),
      adminUserId: String(row.adminUserId),
      adminName: row.adminName,
      action: row.action,
      targetType: row.targetType,
      targetId: String(row.targetId),
      targetName: row.targetName,
      createdAt: new Date(row.createdAt).toISOString(),
    }));
  }
}
