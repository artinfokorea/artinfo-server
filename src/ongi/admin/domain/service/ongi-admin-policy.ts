import { ONGI_USER_TYPE } from '@/ongi/user/domain/entity/ongi-user.entity';

export type OngiAdminType = `${ONGI_USER_TYPE.ADMIN}` | `${ONGI_USER_TYPE.SUPER_ADMIN}`;

/**
 * 관리자 화면 기능 단위 — directory 는 사용자·가족 공간 조회, sensitive 는 이메일 원문·SNS 종류 등 개인정보,
 * photos 는 가족 공간·사용자별 사진 열람 (개인정보 처리방침 5·7조의 운영 책임자 열람, 열람 기록을 남긴다), inquiries 는 앱 문의 답변
 */
export type OngiAdminPermission = 'dashboard' | 'reports' | 'inquiries' | 'directory' | 'configs' | 'grant' | 'sensitive' | 'photos';

const PERMISSIONS: Record<OngiAdminType, readonly OngiAdminPermission[]> = {
  [ONGI_USER_TYPE.ADMIN]: ['dashboard', 'reports', 'inquiries', 'directory'],
  [ONGI_USER_TYPE.SUPER_ADMIN]: ['dashboard', 'reports', 'inquiries', 'directory', 'configs', 'grant', 'sensitive', 'photos'],
};

/**
 * 관리자 API 요청자의 등급 — 아니면 null.
 * 토큰 id 만 믿지 않고 ongi_auths 세션을 확인한다: 서버의 여러 서비스가 같은 JWT 키로 {id} 토큰을 발급하므로
 * 다른 서비스 사용자 id 가 온기 관리자 id 와 겹치면 통과해 버린다.
 */
export function adminTypeOfSession(params: {
  tokenUserId: number;
  session: { userId: number } | null;
  user: { type: string; deletedAt: Date | null } | null;
}): OngiAdminType | null {
  const { tokenUserId, session, user } = params;
  if (!session || session.userId !== tokenUserId) return null;
  if (!user || user.deletedAt) return null;
  if (user.type === ONGI_USER_TYPE.ADMIN) return ONGI_USER_TYPE.ADMIN;
  if (user.type === ONGI_USER_TYPE.SUPER_ADMIN) return ONGI_USER_TYPE.SUPER_ADMIN;

  return null;
}

export function hasAdminPermission(type: OngiAdminType, permission: OngiAdminPermission): boolean {
  return PERMISSIONS[type].includes(permission);
}

/** 관리자 화면의 등급 변경은 USER ↔ ADMIN 만 — SUPER_ADMIN 지정·해제는 DB 에서만, 본인 등급은 못 바꾼다 */
export function canGrantUserType(params: { actorUserId: number; targetUserId: number; targetCurrentType: string; nextType: string }): boolean {
  const { actorUserId, targetUserId, targetCurrentType, nextType } = params;
  if (actorUserId === targetUserId) return false;
  if (targetCurrentType === ONGI_USER_TYPE.SUPER_ADMIN) return false;

  return nextType === ONGI_USER_TYPE.USER || nextType === ONGI_USER_TYPE.ADMIN;
}

export const ONGI_ADMIN_CONFIG_KEYS = ['min_ios_version', 'latest_ios_version', 'min_android_version', 'latest_android_version'] as const;

export function isValidAdminConfig(key: string, value: string): boolean {
  return (ONGI_ADMIN_CONFIG_KEYS as readonly string[]).includes(key) && /^\d+\.\d+\.\d+$/.test(value);
}

/** 'YYYY-MM-DD' 기준 최근 days 일(오늘 포함)을 오래된 날부터, 기록 없는 날은 0 */
export function fillDailySeries(rows: { day: string; count: number }[], todayKey: string, days: number): { day: string; count: number }[] {
  const counts = new Map(rows.map(row => [row.day, row.count]));
  const today = new Date(`${todayKey}T00:00:00Z`);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - 1 - index) * 24 * 60 * 60 * 1000);
    const day = date.toISOString().slice(0, 10);

    return { day, count: counts.get(day) ?? 0 };
  });
}

/** 'joel.kim@gmail.com' → 'jo***@gmail.com' */
export function maskEmail(email: string | null): string | null {
  if (email === null) return null;
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  const local = email.slice(0, at);

  return `${local.slice(0, local.length <= 2 ? 1 : 2)}***${email.slice(at)}`;
}
