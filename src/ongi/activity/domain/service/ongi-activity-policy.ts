/** 접속 기록을 DB 에 쓰는 최소 간격 — 요청마다 쓰지 않는다 */
export const ONGI_ACTIVITY_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

/** 앱이 한 번에 보낼 수 있는 사용 시간 — 전송이 밀렸다 한꺼번에 와도 30분까지만 받는다 */
export const ONGI_ACTIVITY_MAX_PING_SECONDS = 30 * 60;

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 한국 시간 기준 'YYYY-MM-DD' — 활동 집계의 하루는 한국 자정에 바뀐다 */
export function kstDayKey(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 마지막으로 기록한 뒤 5분이 지났거나 한국 날짜가 바뀌었으면 다시 기록한다 */
export function shouldTouchActivity(lastTouchedAt: Date | null, now: Date): boolean {
  if (!lastTouchedAt) return true;
  if (kstDayKey(lastTouchedAt) !== kstDayKey(now)) return true;

  return now.getTime() - lastTouchedAt.getTime() >= ONGI_ACTIVITY_TOUCH_INTERVAL_MS;
}

export function normalizePingSeconds(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) return 0;

  return Math.min(Math.round(raw), ONGI_ACTIVITY_MAX_PING_SECONDS);
}

export type OngiActivityPlatform = 'ios' | 'android';

export function normalizePlatform(raw: unknown): OngiActivityPlatform | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim().toLowerCase();

  return value === 'ios' || value === 'android' ? value : null;
}

export function normalizeAppVersion(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();

  return /^\d+\.\d+\.\d+$/.test(value) ? value : null;
}
