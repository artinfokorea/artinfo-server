import { USER_TYPE } from '@/user/entity/user.entity';
import { AdminSelfActionForbidden, AdminTargetIsAdmin, AdminUserAlreadyWithdrawn, AdminUserNotFound } from '@/admin/domain/artinfo-admin.exception';

/**
 * 회원 관리 목록 필터
 * - all: 탈퇴하지 않은 회원 전체
 * - app: 앱을 설치한 회원 (푸시 토큰이 1개 이상)
 * - web: 앱 없이 웹만 쓰는 회원
 * - push_on / push_off: 앱 회원 중 채용 알림을 켠 / 끈 회원 (저장 안 했으면 켜짐)
 * - admin: 관리자 계정
 * - withdrawn: 탈퇴한 회원
 */
export const ADMIN_USER_FILTERS = ['all', 'app', 'web', 'push_on', 'push_off', 'admin', 'withdrawn'] as const;
export type AdminUserFilter = (typeof ADMIN_USER_FILTERS)[number];

export const ADMIN_USERS_DEFAULT_SIZE = 20;
export const ADMIN_USERS_MAX_SIZE = 100;
export const ADMIN_USERS_QUERY_MAX_LENGTH = 100;

/** users 별칭이 u 일 때 — 앱 설치 여부(푸시 토큰 보유) */
export const USER_HAS_APP_SQL = `EXISTS (SELECT 1 FROM artinfo_push_tokens t WHERE t.user_id = u.id)`;
/** users 별칭이 u 일 때 — 채용 알림 수신 여부 (설정 행이 없으면 켜짐) */
export const USER_PUSH_JOB_SQL = `COALESCE((SELECT p.job FROM artinfo_push_preferences p WHERE p.user_id = u.id), TRUE)`;

export function normalizeFilter(raw: string | undefined): AdminUserFilter {
  return (ADMIN_USER_FILTERS as readonly string[]).includes(raw ?? '') ? (raw as AdminUserFilter) : 'all';
}

/** 필터별 WHERE 조건 (users 별칭 u) */
export function filterWhereSql(filter: AdminUserFilter): string {
  switch (filter) {
    case 'app':
      return `u.deleted_at IS NULL AND ${USER_HAS_APP_SQL}`;
    case 'web':
      return `u.deleted_at IS NULL AND NOT ${USER_HAS_APP_SQL}`;
    case 'push_on':
      return `u.deleted_at IS NULL AND ${USER_HAS_APP_SQL} AND ${USER_PUSH_JOB_SQL} = TRUE`;
    case 'push_off':
      return `u.deleted_at IS NULL AND ${USER_HAS_APP_SQL} AND ${USER_PUSH_JOB_SQL} = FALSE`;
    case 'admin':
      return `u.deleted_at IS NULL AND u.type = 'ADMIN'`;
    case 'withdrawn':
      return `u.deleted_at IS NOT NULL`;
    case 'all':
    default:
      return `u.deleted_at IS NULL`;
  }
}

export function clampPage(page: number | undefined): number {
  if (page === undefined || !Number.isFinite(page)) return 1;
  return Math.max(1, Math.floor(page));
}

export function clampSize(size: number | undefined): number {
  if (size === undefined || !Number.isFinite(size)) return ADMIN_USERS_DEFAULT_SIZE;
  return Math.min(ADMIN_USERS_MAX_SIZE, Math.max(1, Math.floor(size)));
}

/** 검색어 — 앞뒤 공백 제거, 비면 null, 너무 길면 자른다 */
export function normalizeQuery(raw: string | undefined): string | null {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return null;
  return trimmed.slice(0, ADMIN_USERS_QUERY_MAX_LENGTH);
}

/** 010-1234-5678 → 010-****-5678, 01012345678 → 010****5678. 짧으면 전부 가린다 */
export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return '*'.repeat(phone.length);
  const head = 3;
  const tail = 4;
  let seen = 0;
  return phone
    .split('')
    .map(ch => {
      if (!/\d/.test(ch)) return ch;
      seen += 1;
      return seen <= head || seen > digits.length - tail ? ch : '*';
    })
    .join('');
}

export interface AdminUserTarget {
  id: number;
  type: string;
  deletedAt: Date | null;
}

/** 역할 변경 — 대상이 있어야 하고, 탈퇴 전이어야 하며, 자기 자신은 못 바꾼다 (관리자 0명 사고 방지) */
export function assertCanChangeType(actorId: number, target: AdminUserTarget | null): void {
  if (!target) throw new AdminUserNotFound();
  if (target.deletedAt) throw new AdminUserAlreadyWithdrawn();
  if (target.id === actorId) throw new AdminSelfActionForbidden();
}

/** 탈퇴 처리 — 자기 자신·다른 관리자는 못 한다 (관리자는 먼저 일반 회원으로 내린 뒤) */
export function assertCanWithdraw(actorId: number, target: AdminUserTarget | null): void {
  if (!target) throw new AdminUserNotFound();
  if (target.deletedAt) throw new AdminUserAlreadyWithdrawn();
  if (target.id === actorId) throw new AdminSelfActionForbidden();
  if (target.type === USER_TYPE.ADMIN) throw new AdminTargetIsAdmin();
}
