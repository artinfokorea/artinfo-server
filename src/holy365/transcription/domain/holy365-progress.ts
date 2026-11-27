/**
 * 완주 횟수 — 범위(장·권·전체)의 모든 절을 n번 이상 썼으면 n번 완주.
 * 한 절이라도 안 썼으면 0, 다 썼으면 가장 적게 쓴 절의 횟수.
 */
export function completedPasses(totalVerses: number, typedVerses: number, minCount: number): number {
  if (totalVerses <= 0 || typedVerses < totalVerses) return 0;

  return Math.max(0, minCount);
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayNumber(day: string): number {
  return Math.round(Date.parse(`${day}T00:00:00Z`) / DAY_MS);
}

/** 연속 필사일 — 오늘 또는 어제까지 이어지면 current 로 친다 */
export function streakOf(days: string[], today: string): { current: number; longest: number } {
  const numbers = [...new Set(days.map(dayNumber))].sort((a, b) => a - b);
  if (numbers.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < numbers.length; i++) {
    run = numbers[i] === numbers[i - 1] + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const todayNumber = dayNumber(today);
  const last = numbers[numbers.length - 1];
  const current = last === todayNumber || last === todayNumber - 1 ? run : 0;

  return { current, longest };
}

export const HOLY365_MAX_SECONDS_PER_VERSE = 600;

export function clampSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;

  return Math.min(HOLY365_MAX_SECONDS_PER_VERSE, Math.max(0, Math.round(seconds)));
}

/** 한 장에서 "n번 쓴 절이 몇 개" 인지 — holy365_verse_counts 를 (count) 로 묶은 결과 */
export interface Holy365CountBucket {
  count: number;
  n: number;
}

export interface Holy365ChapterProgress {
  /** 이 장을 몇 번 완주했는지 */
  passes: number;
  /** 지금 쓰는 회차(passes + 1)에서 쓴 절 수 */
  inPass: number;
  /** 성경 전체 회차(bibleRounds + 1) 기준으로 쓴 절 수 */
  doneForRound: number;
}

export function chapterProgress(verseCount: number, buckets: Holy365CountBucket[], bibleRounds: number): Holy365ChapterProgress {
  const typed = buckets.reduce((sum, bucket) => sum + bucket.n, 0);
  const minCount = buckets.length ? Math.min(...buckets.map(bucket => bucket.count)) : 0;
  const passes = completedPasses(verseCount, typed, minCount);
  const countAbove = (threshold: number) => buckets.filter(bucket => bucket.count > threshold).reduce((sum, bucket) => sum + bucket.n, 0);

  return { passes, inPass: countAbove(passes), doneForRound: countAbove(bibleRounds) };
}
