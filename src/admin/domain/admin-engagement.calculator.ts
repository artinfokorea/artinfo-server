const DAY_MS = 24 * 60 * 60 * 1000;

const toDate = (day: string) => new Date(`${day}T00:00:00Z`);
const toDay = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (day: string, n: number) => toDay(new Date(toDate(day).getTime() + n * DAY_MS));

/** 그 주의 월요일 (YYYY-MM-DD) */
export function mondayOf(day: string): string {
  const weekday = toDate(day).getUTCDay(); // 0 = 일요일
  return addDays(day, weekday === 0 ? -6 : 1 - weekday);
}

export const RETENTION_WEEKS = 4;

export interface RetentionRow {
  /** 첫 방문 주의 월요일 */
  cohort: string;
  /** 그 주에 처음 온 방문자 수 */
  size: number;
  /** 첫 방문 주로부터 몇 주 뒤인지 (1 ~ 4) */
  week: number;
  /** 그 주차에 다시 온 방문자 수 */
  active: number;
}

export interface RetentionCohort {
  cohort: string;
  size: number;
  /** 1~4주차 재방문 비율(%). 아직 오지 않은 주차나 방문자가 없는 주는 null */
  weeks: (number | null)[];
}

/**
 * 주간 리텐션 표. 이번 주를 뺀 최근 cohorts 개 주를 오래된 순으로.
 * N주차는 (첫 방문 주 + N주)가 이번 주 이전이거나 이번 주일 때만 측정한다.
 */
export function buildRetentionCohorts(rows: RetentionRow[], sizes: { cohort: string; size: number }[], cohorts: number, today: string): RetentionCohort[] {
  const thisMonday = mondayOf(today);
  const sizeOf = new Map<string, number>();
  sizes.forEach(s => sizeOf.set(s.cohort, Number(s.size)));
  rows.forEach(r => sizeOf.set(r.cohort, Number(r.size)));

  const activeOf = new Map<string, number>();
  rows.forEach(r => activeOf.set(`${r.cohort}:${r.week}`, Number(r.active)));

  const result: RetentionCohort[] = [];
  for (let i = cohorts; i >= 1; i--) {
    const cohort = addDays(thisMonday, -7 * i);
    const size = sizeOf.get(cohort) ?? 0;
    const weeks = Array.from({ length: RETENTION_WEEKS }, (_, index) => {
      const week = index + 1;
      if (size === 0 || addDays(cohort, 7 * week) > thisMonday) return null;
      const active = activeOf.get(`${cohort}:${week}`) ?? 0;
      return Math.round((active / size) * 1000) / 10;
    });
    result.push({ cohort, size, weeks });
  }
  return result;
}

export interface EngagementRow {
  date: string;
  visitors: number;
  members: number;
  /** 그날 방문자들의 체류 초 합계 */
  seconds: number;
}

export interface EngagementPoint {
  date: string;
  /** 방문자(비회원 포함) 수 */
  visitors: number;
  /** 그중 로그인한 회원 수 */
  members: number;
  /** 방문자 1명당 평균 체류 초 */
  avgSeconds: number;
}

/** today(포함)까지 days 일을 채운다. 없는 날은 0 */
export function buildEngagementSeries(rows: EngagementRow[], days: number, today: string): EngagementPoint[] {
  const byDate = new Map(rows.map(r => [r.date, r]));
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1);
    const row = byDate.get(date);
    const visitors = Number(row?.visitors ?? 0);
    const seconds = Number(row?.seconds ?? 0);
    return {
      date,
      visitors,
      members: Number(row?.members ?? 0),
      avgSeconds: visitors > 0 ? Math.round(seconds / visitors) : 0,
    };
  });
}
