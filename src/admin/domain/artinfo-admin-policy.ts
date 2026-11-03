import { USER_TYPE } from '@/user/entity/user.entity';
import { ArtinfoAdminForbidden } from '@/admin/domain/artinfo-admin.exception';

export interface AdminCandidate {
  type: string;
  deletedAt: Date | null;
}

/**
 * 아트인포 관리자 판정 — DB 의 users.type 이 ADMIN 이고 탈퇴하지 않은 사용자만.
 * (access token 에는 type 이 없으므로 토큰만으로 판단하지 않는다)
 */
export function assertArtinfoAdmin(user: AdminCandidate | null): void {
  if (!user || user.deletedAt || user.type !== USER_TYPE.ADMIN) {
    throw new ArtinfoAdminForbidden();
  }
}

/* ---------- 지표에서 관리자 계정 제외 ---------- */

/** 관리자 계정 ID 목록 — users.type 이 ADMIN */
export const ADMIN_USER_IDS_SQL = `SELECT id FROM users WHERE type = 'ADMIN'`;

/** users 테이블 행이 관리자가 아닌 조건 */
export const USER_NOT_ADMIN_SQL = `type <> 'ADMIN'`;

/** user_id 가 관리자를 가리키지 않는 조건 (auths 처럼 user_id 가 NOT NULL 인 테이블용) */
export const USER_ID_NOT_ADMIN_SQL = `user_id NOT IN (${ADMIN_USER_IDS_SQL})`;

/** 관리자 계정으로 로그인한 적이 있는 방문자(브라우저)는 로그아웃한 날의 기록까지 통째로 뺀다 */
export const VISITOR_NOT_ADMIN_SQL = `visitor_id NOT IN (SELECT visitor_id FROM artinfo_visitor_daily_activity WHERE user_id IN (${ADMIN_USER_IDS_SQL}))`;
