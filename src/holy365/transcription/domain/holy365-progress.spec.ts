import { chapterProgress, clampSeconds, completedPasses, streakOf } from '@/holy365/transcription/domain/holy365-progress';

describe('completedPasses — 몇 번 완주했는지', () => {
  it('한 절이라도 안 썼으면 0번', () => {
    expect(completedPasses(31, 30, 5)).toBe(0);
  });

  it('모든 절을 썼으면 가장 적게 쓴 절의 횟수', () => {
    expect(completedPasses(31, 31, 1)).toBe(1);
    expect(completedPasses(31, 31, 3)).toBe(3);
  });

  it('전체 절 수가 0 이면 0번', () => {
    expect(completedPasses(0, 0, 0)).toBe(0);
  });
});

describe('streakOf — 연속 필사일', () => {
  it('오늘까지 이어진 날 수', () => {
    expect(streakOf(['2026-11-25', '2026-11-26', '2026-11-27'], '2026-11-27')).toEqual({ current: 3, longest: 3 });
  });

  it('오늘 아직 안 썼어도 어제까지 이어졌으면 유지', () => {
    expect(streakOf(['2026-11-25', '2026-11-26'], '2026-11-27')).toEqual({ current: 2, longest: 2 });
  });

  it('어제도 안 썼으면 0 — 가장 긴 기록은 따로', () => {
    expect(streakOf(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-20'], '2026-11-27')).toEqual({ current: 0, longest: 3 });
  });

  it('순서가 섞이고 중복이 있어도 된다', () => {
    expect(streakOf(['2026-11-27', '2026-11-26', '2026-11-27', '2026-11-24'], '2026-11-27')).toEqual({ current: 2, longest: 2 });
  });

  it('월 경계를 넘는다', () => {
    expect(streakOf(['2026-02-27', '2026-02-28', '2026-03-01'], '2026-03-01')).toEqual({ current: 3, longest: 3 });
  });

  it('기록이 없으면 0', () => {
    expect(streakOf([], '2026-11-27')).toEqual({ current: 0, longest: 0 });
  });
});

describe('clampSeconds — 한 절에 쓴 시간', () => {
  it('0~600초 사이 정수로 자른다', () => {
    expect(clampSeconds(12.6)).toBe(13);
    expect(clampSeconds(-3)).toBe(0);
    expect(clampSeconds(5000)).toBe(600);
    expect(clampSeconds(Number.NaN)).toBe(0);
  });
});

describe('chapterProgress — 장 하나의 필사 상태 (절별 횟수 분포로 계산)', () => {
  it('아무것도 안 썼으면 0번 · 이번 회차 0절', () => {
    expect(chapterProgress(31, [], 0)).toEqual({ passes: 0, inPass: 0, doneForRound: 0 });
  });

  it('일부만 썼으면 0번 완주 · 쓴 절이 이번 회차 진행', () => {
    expect(chapterProgress(31, [{ count: 1, n: 10 }], 0)).toEqual({ passes: 0, inPass: 10, doneForRound: 10 });
  });

  it('전부 한 번 썼으면 1번 완주 · 새 회차는 0절부터', () => {
    expect(chapterProgress(31, [{ count: 1, n: 31 }], 0)).toEqual({ passes: 1, inPass: 0, doneForRound: 31 });
  });

  it('두 번째 회차를 쓰는 중 — 2번 쓴 절이 이번 회차 진행', () => {
    expect(
      chapterProgress(
        31,
        [
          { count: 1, n: 21 },
          { count: 2, n: 10 },
        ],
        0,
      ),
    ).toEqual({ passes: 1, inPass: 10, doneForRound: 31 });
  });

  it('성경 전체 회차(bibleRounds)보다 많이 쓴 절만 전체 진행에 친다', () => {
    expect(
      chapterProgress(
        31,
        [
          { count: 1, n: 21 },
          { count: 2, n: 10 },
        ],
        1,
      ),
    ).toEqual({ passes: 1, inPass: 10, doneForRound: 10 });
  });
});
