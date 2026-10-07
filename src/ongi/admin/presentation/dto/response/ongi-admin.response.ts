import { ApiProperty } from '@nestjs/swagger';
import { signOngiMediaUrl } from '@/ongi/common/ongi-media-url';
import { OngiAdminMeView, OngiAdminStatsView } from '@/ongi/admin/application/usecase/ongi-admin.usecase';
import {
  OngiAdminAccessLogRow,
  OngiAdminDashboardTotals,
  OngiAdminGroupMemberRow,
  OngiAdminGroupRow,
  OngiAdminInquiryRow,
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
  @ApiProperty({ type: [String], description: 'dashboard · reports · inquiries · directory · configs · grant · sensitive · photos · deleteGroup' })
  permissions: string[];

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

export class OngiAdminStatsResponse {
  @ApiProperty({ type: String, description: "한국 시간 기준 오늘 'YYYY-MM-DD'" }) today: string;
  @ApiProperty({ type: String, nullable: true, description: '활동 기록을 시작한 날 — 그 전의 접속 지표는 없다' }) trackingSince: string | null;
  @ApiProperty({ type: Object, description: '접속자 — dau(오늘) · wau(7일) · mau(30일) · stickiness(하루 평균 ÷ 30일, %)' })
  active: OngiAdminStatsView['active'];
  @ApiProperty({ type: [Object], description: '최근 30일 일별 추이 (오래된 날부터)' }) daily: OngiAdminStatsView['daily'];
  @ApiProperty({ type: Object, description: '최근 7일 체류시간 — 사용 시간을 보내는 앱(1.0.10 이상) 사용자만' })
  engagement: OngiAdminStatsView['engagement'];
  @ApiProperty({ type: [Object], description: '가입 1 · 7 · 30일 뒤 다시 온 비율 — 대상자가 없으면 rate 는 null' })
  retention: OngiAdminStatsView['retention'];
  @ApiProperty({ type: [Object], description: '재방문율을 역할로 나눠서 — admin(공간을 만든 사람) · member(초대받은 사람) · none(공간 없음)' })
  retentionByRole: OngiAdminStatsView['retentionByRole'];
  @ApiProperty({ type: Object, description: '재방문 곡선 — 최근 30일 가입자가 가입 1~30일째에 다시 온 비율 (total · byRole), 대상 없는 날은 rate null' })
  retentionCurve: OngiAdminStatsView['retentionCurve'];
  @ApiProperty({ type: Object, description: '7일 안 활성화 — 만든 지 7일 지난 공간 중 두 번째 가족 합류, 가입 7일 지난 사용자 중 첫 사진 (최근 30일)' })
  activation: OngiAdminStatsView['activation'];
  @ApiProperty({ type: [Object], description: '최근 7일 접속자가 며칠 왔는지 — 1일부터 7일까지' }) visitDays: OngiAdminStatsView['visitDays'];
  @ApiProperty({ type: Object, description: '최근 7일 접속자 구성 — 신규 · 기존 · 부활' }) activeMix: OngiAdminStatsView['activeMix'];
  @ApiProperty({ type: Object, description: '공간 — 혼자인 공간 · 최근 7일 활동한 공간 · 평균 구성원 수' }) spaces: OngiAdminStatsView['spaces'];
  @ApiProperty({ type: Object, description: '가입 후 전환 — 공간 참여 · 첫 사진 · 첫 대화 · 푸시 허용' }) funnel: OngiAdminStatsView['funnel'];
  @ApiProperty({ type: [Object], description: "최근 30일 접속자의 플랫폼 (모르면 'unknown')" }) platforms: OngiAdminStatsView['platforms'];
  @ApiProperty({ type: [Object], description: "최근 30일 접속자의 앱 버전 (1.0.9 이하는 'unknown')" }) versions: OngiAdminStatsView['versions'];
  @ApiProperty({ type: Number, description: '수치에서 뺀 테스트 계정 수' }) excludedTestUsers: number;

  constructor(view: OngiAdminStatsView) {
    this.today = view.today;
    this.trackingSince = view.trackingSince;
    this.active = view.active;
    this.daily = view.daily;
    this.engagement = view.engagement;
    this.retention = view.retention;
    this.retentionByRole = view.retentionByRole;
    this.retentionCurve = view.retentionCurve;
    this.activation = view.activation;
    this.visitDays = view.visitDays;
    this.activeMix = view.activeMix;
    this.spaces = view.spaces;
    this.funnel = view.funnel;
    this.platforms = view.platforms;
    this.versions = view.versions;
    this.excludedTestUsers = view.excludedTestUsers;
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

export const toAdminUserItem = (user: OngiAdminUserRow) => ({
  id: String(user.id),
  name: user.name,
  /** 민감 정보 권한이 없으면 가려진 값 */
  email: user.email,
  /** 민감 정보 권한이 없으면 null */
  snsType: user.snsType,
  type: user.type,
  isTest: user.isTest,
  createdAt: new Date(user.createdAt).toISOString(),
  deletedAt: iso(user.deletedAt),
  /** 접속 기록을 시작한 뒤로 접속하지 않았으면 null */
  lastSeenAt: iso(user.lastSeenAt),
  groupCount: user.groupCount,
  photoCount: user.photoCount,
  groups: user.groups.map(group => ({ groupId: String(group.groupId), groupName: group.groupName, memberName: group.memberName, role: group.role })),
});

export class OngiAdminUserListResponse {
  @ApiProperty({ type: [Object], description: '사용자 목록 (최근 가입 순, 50개씩)' }) users: ReturnType<typeof toAdminUserItem>[];

  constructor(rows: OngiAdminUserRow[]) {
    this.users = rows.map(toAdminUserItem);
  }
}

export class OngiAdminUserDetailResponse {
  @ApiProperty({ type: Object }) user: ReturnType<typeof toAdminUserItem>;
  @ApiProperty({ type: [Object], description: '소속 가족 공간' }) groups: {
    groupId: string;
    groupName: string;
    memberName: string;
    role: string;
    joinedAt: string;
  }[];

  constructor(view: { user: OngiAdminUserRow; groups: OngiAdminUserGroupRow[] }) {
    this.user = toAdminUserItem(view.user);
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

export class OngiAdminInquiryListResponse {
  @ApiProperty({ type: [Object], description: '문의 목록 (최근 순, 50개씩) — 민감 정보 권한이 없으면 이메일은 가려진다' }) inquiries: {
    id: string;
    status: 'open' | 'answered';
    user: { id: string; name: string | null; email: string | null };
    content: string;
    answer: string | null;
    answeredByName: string | null;
    answeredAt: string | null;
    createdAt: string;
  }[];

  constructor(rows: OngiAdminInquiryRow[]) {
    this.inquiries = rows.map(row => ({
      id: String(row.id),
      status: row.answer === null ? 'open' : 'answered',
      user: { id: String(row.userId), name: row.userName, email: row.userEmail },
      content: row.content,
      answer: row.answer,
      answeredByName: row.answeredByName,
      answeredAt: iso(row.answeredAt),
      createdAt: new Date(row.createdAt).toISOString(),
    }));
  }
}
