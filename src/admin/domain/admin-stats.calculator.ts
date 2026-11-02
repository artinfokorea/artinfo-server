export const DAILY_METRICS = ['signups', 'activeUsers', 'jobs', 'posts', 'comments'] as const;
export type DailyMetric = (typeof DAILY_METRICS)[number];

export type DailyPoint = { date: string } & Record<DailyMetric, number>;

export interface DailyRow {
  /** KST 날짜 YYYY-MM-DD */
  date: string;
  metric: string;
  count: number;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 한국 시간 기준 날짜 YYYY-MM-DD */
export function kstDateString(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 일별 지표 기간: 기본 30일, 7~90일 */
export function clampDays(days: number | undefined): number {
  if (days === undefined || Number.isNaN(days)) return 30;
  return Math.min(90, Math.max(7, Math.floor(days)));
}

/** today(포함)까지 days 일치 날짜 목록을 만들고, 지표별 count 를 채운다. 없는 날은 0 */
export function buildDailySeries(rows: DailyRow[], days: number, today: string): DailyPoint[] {
  const end = new Date(`${today}T00:00:00Z`).getTime();
  const series: DailyPoint[] = [];
  const byDate = new Map<string, DailyPoint>();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(end - i * DAY_MS).toISOString().slice(0, 10);
    const point = { date, signups: 0, activeUsers: 0, jobs: 0, posts: 0, comments: 0 };
    series.push(point);
    byDate.set(date, point);
  }

  for (const row of rows) {
    const point = byDate.get(row.date);
    if (!point || !(DAILY_METRICS as readonly string[]).includes(row.metric)) continue;
    point[row.metric as DailyMetric] = Number(row.count);
  }

  return series;
}

/** 조회 날짜 — YYYY-MM-DD 가 아니거나 미래면 오늘(한국) */
export function normalizeDay(raw: string | undefined, today: string): string {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return today;
  return raw > today ? today : raw;
}
