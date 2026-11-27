const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 한국 시간(UTC+9) 기준 날짜 'YYYY-MM-DD' — 일별 활동·연속 필사일 계산 기준 */
export function kstDateOf(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 오늘(한국 시간)에서 n일 전 날짜 */
export function kstDaysAgo(days: number, now: Date = new Date()): string {
  return kstDateOf(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));
}
