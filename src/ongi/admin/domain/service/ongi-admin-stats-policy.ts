const DAY_MS = 24 * 60 * 60 * 1000;

/** 비율(%) — 소수 한 자리, 모수가 0이면 0 */
export function percentOf(part: number, whole: number): number {
  if (whole <= 0) return 0;

  return Math.round((part / whole) * 1000) / 10;
}

/** 평균 — digits 자리까지, 개수가 0이면 0 */
export function averageOf(total: number, count: number, digits = 0): number {
  if (count <= 0) return 0;
  const unit = 10 ** digits;

  return Math.round((total / count) * unit) / unit;
}

/** todayKey('YYYY-MM-DD') 까지 days 일을 오래된 날부터 */
export function dayKeysUntil(todayKey: string, days: number): string[] {
  const today = new Date(`${todayKey}T00:00:00Z`).getTime();

  return Array.from({ length: days }, (_, index) => new Date(today - (days - 1 - index) * DAY_MS).toISOString().slice(0, 10));
}

export const ONGI_RETENTION_DAYS = [1, 7, 30] as const;

export interface OngiRetentionView {
  days: number;
  cohort: number;
  retained: number;
  /** 대상자가 없으면 null — 아무도 안 돌아온 0% 와 구분한다 */
  rate: number | null;
}

/** 가입 N일 뒤 다시 온 비율 — 항상 1 · 7 · 30일 순서 */
export function buildRetention(rows: { days: number; cohort: number; retained: number }[]): OngiRetentionView[] {
  return ONGI_RETENTION_DAYS.map(days => {
    const row = rows.find(r => r.days === days);
    const cohort = row?.cohort ?? 0;
    const retained = row?.retained ?? 0;

    return { days, cohort, retained, rate: cohort > 0 ? percentOf(retained, cohort) : null };
  });
}

export const ONGI_RETENTION_ROLES = ['admin', 'member', 'none'] as const;

export interface OngiRoleRetentionView {
  role: (typeof ONGI_RETENTION_ROLES)[number];
  retention: OngiRetentionView[];
}

/** 역할별 재방문율 — 항상 admin · member · none 순서, 행이 없는 역할도 null 로 채운다 */
export function buildRetentionByRole(rows: { role: string; days: number; cohort: number; retained: number }[]): OngiRoleRetentionView[] {
  return ONGI_RETENTION_ROLES.map(role => ({ role, retention: buildRetention(rows.filter(row => row.role === role)) }));
}

export interface OngiRetentionCurveView {
  /** 역할을 합친 전체 — 1일째부터 maxDays 일째까지 */
  total: OngiRetentionView[];
  byRole: OngiRoleRetentionView[];
}

/** 재방문 곡선 — 역할마다 1~maxDays 일째를 빠짐없이 채우고(대상 없는 날은 null), 전체는 역할의 합 */
export function buildRetentionCurve(rows: { role: string; days: number; cohort: number; retained: number }[], maxDays: number): OngiRetentionCurveView {
  const pointsOf = (filter: (row: { role: string }) => boolean): OngiRetentionView[] =>
    Array.from({ length: maxDays }, (_, index) => {
      const days = index + 1;
      const matched = rows.filter(row => row.days === days && filter(row));
      const cohort = matched.reduce((sum, row) => sum + row.cohort, 0);
      const retained = matched.reduce((sum, row) => sum + row.retained, 0);

      return { days, cohort, retained, rate: cohort > 0 ? percentOf(retained, cohort) : null };
    });

  return {
    total: pointsOf(() => true),
    byRole: ONGI_RETENTION_ROLES.map(role => ({ role, retention: pointsOf(row => row.role === role) })),
  };
}

/** 방문일수 분포 — 1일부터 days 일까지 빠짐없이, 없는 일수는 0 */
export function buildVisitDays(rows: { days: number; users: number }[], days: number): { days: number; users: number }[] {
  return Array.from({ length: days }, (_, index) => ({ days: index + 1, users: rows.find(row => row.days === index + 1)?.users ?? 0 }));
}

const STICKINESS_DAYS = 7;

/**
 * 고착도 — 하루 평균 접속자 ÷ 최근 30일 접속자 (%).
 * 평균은 최근 7일로 내되, 기록을 시작한 지 7일이 안 됐으면 시작한 날부터만 센다 (기록 전의 0 이 평균을 깎지 않게).
 */
export function buildStickiness(daily: { day: string; activeUsers: number }[], mau: number, trackingSince: string | null): number {
  if (!trackingSince || mau <= 0) return 0;
  const tracked = daily.slice(-STICKINESS_DAYS).filter(row => row.day >= trackingSince);
  if (tracked.length === 0) return 0;
  const averageDau = tracked.reduce((sum, row) => sum + row.activeUsers, 0) / tracked.length;

  return percentOf(averageDau, mau);
}
