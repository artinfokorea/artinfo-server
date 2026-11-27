export type Holy365RankingPeriod = 'day' | 'week' | 'month';

export const HOLY365_RANKING_PERIODS: Holy365RankingPeriod[] = ['day', 'week', 'month'];

const DAY_MS = 24 * 60 * 60 * 1000;

/** 랭킹 기간의 시작일 (한국 날짜 'YYYY-MM-DD') — 일간: 오늘, 주간: 이번 주 월요일, 월간: 이번 달 1일 */
export function periodStart(period: Holy365RankingPeriod, today: string): string {
  if (period === 'day') return today;
  if (period === 'month') return `${today.slice(0, 7)}-01`;

  const date = new Date(`${today}T00:00:00Z`);
  const sinceMonday = (date.getUTCDay() + 6) % 7;

  return new Date(date.getTime() - sinceMonday * DAY_MS).toISOString().slice(0, 10);
}

/** 이미 절 수 내림차순인 목록에 순위를 붙인다 — 동점은 같은 순위 (1, 2, 2, 4) */
export function rankRows<T extends { verses: number }>(rows: T[]): (T & { rank: number })[] {
  return rows
    .map((row, index) => ({ ...row, rank: index > 0 && rows[index - 1].verses === row.verses ? -1 : index + 1 }))
    .map((row, index, all) => {
      if (row.rank !== -1) return row;
      let back = index - 1;
      while (all[back].rank === -1) back--;
      return { ...row, rank: all[back].rank };
    });
}
