export const ONGI_ADMIN_REPOSITORY = Symbol('ONGI_ADMIN_REPOSITORY');

export interface OngiAdminDashboardTotals {
  users: number;
  newUsers7d: number;
  groups: number;
  photos: number;
  videos: number;
  comments: number;
  openReports: number;
}

export interface OngiAdminReportRow {
  id: number;
  status: string;
  reason: string;
  createdAt: Date;
  reporterUserId: number;
  reporterName: string | null;
  targetType: string;
  targetId: number;
  /** 사진 신고: 사진 · 댓글 신고: 댓글이 달린 사진 */
  photoId: number | null;
  photoUrl: string | null;
  photoThumbUrl: string | null;
  photoMediaType: string | null;
  photoCaption: string | null;
  commentText: string | null;
  /** 콘텐츠 작성자 또는 신고된 구성원 이름 */
  targetName: string | null;
  targetUserId: number | null;
  groupId: number | null;
  groupName: string | null;
  /** 대상이 이미 삭제됐는지 */
  targetDeleted: boolean;
}

export interface OngiAdminUserRow {
  id: number;
  name: string;
  email: string | null;
  /** 민감 정보 권한이 없는 관리자에게는 null 로 가려진다 */
  snsType: string | null;
  type: string;
  createdAt: Date;
  deletedAt: Date | null;
  groupCount: number;
  photoCount: number;
}

export interface OngiAdminUserGroupRow {
  groupId: number;
  groupName: string;
  memberName: string;
  role: string;
  joinedAt: Date;
}

export interface OngiAdminGroupRow {
  id: number;
  name: string;
  createdAt: Date;
  memberCount: number;
  photoCount: number;
  lastPhotoAt: Date | null;
}

export interface OngiAdminGroupMemberRow {
  memberId: number;
  userId: number;
  name: string;
  role: string;
  joinedAt: Date;
  photoCount: number;
}

export interface OngiAdminPhotoRow {
  id: number;
  groupId: number;
  groupName: string;
  authorMemberId: number;
  authorName: string | null;
  authorUserId: number | null;
  url: string;
  thumbUrl: string | null;
  mediaType: string;
  caption: string | null;
  createdAt: Date;
}

export interface OngiAdminAccessLogRow {
  id: number;
  adminUserId: number;
  adminName: string | null;
  action: string;
  targetType: string;
  targetId: number;
  targetName: string | null;
  createdAt: Date;
}

export interface OngiAdminPage {
  limit: number;
  offset: number;
}

export interface IOngiAdminRepository {
  findSessionByAccessToken(accessToken: string): Promise<{ userId: number } | null>;
  findUserTypeById(userId: number): Promise<{ id: number; name: string; type: string; deletedAt: Date | null } | null>;

  getDashboardTotals(): Promise<OngiAdminDashboardTotals>;
  /** 최근 days 일 가입 수 — day 는 서버(DB) 기준 'YYYY-MM-DD' */
  scanDailySignups(days: number): Promise<{ day: string; count: number }[]>;
  todayKey(): Promise<string>;

  scanReports(status: string | null, page: OngiAdminPage): Promise<OngiAdminReportRow[]>;
  findReportById(id: number): Promise<{ id: number; targetType: string; targetId: number; status: string } | null>;
  updateReportStatus(id: number, status: string): Promise<void>;

  /** query 는 이름·id, includeEmail 이면 이메일까지 검색 */
  scanUsers(query: string | null, includeEmail: boolean, page: OngiAdminPage): Promise<OngiAdminUserRow[]>;
  findUserById(id: number): Promise<OngiAdminUserRow | null>;
  scanUserGroups(userId: number): Promise<OngiAdminUserGroupRow[]>;
  updateUserType(userId: number, type: string): Promise<void>;

  scanGroups(query: string | null, page: OngiAdminPage): Promise<OngiAdminGroupRow[]>;
  findGroupById(id: number): Promise<OngiAdminGroupRow | null>;
  scanGroupMembers(groupId: number): Promise<OngiAdminGroupMemberRow[]>;

  /** 삭제되지 않은 사진·영상 (최신순) */
  scanGroupPhotos(groupId: number, page: OngiAdminPage): Promise<OngiAdminPhotoRow[]>;
  scanUserPhotos(userId: number, page: OngiAdminPage): Promise<OngiAdminPhotoRow[]>;
  createAccessLog(log: { adminUserId: number; action: string; targetType: string; targetId: number }): Promise<void>;
  scanAccessLogs(page: OngiAdminPage): Promise<OngiAdminAccessLogRow[]>;

  scanConfigs(keys: readonly string[]): Promise<{ key: string; value: string }[]>;
  upsertConfig(key: string, value: string): Promise<void>;
}
