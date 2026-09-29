import { averageOf, buildRetention, buildStickiness, dayKeysUntil, percentOf } from '@/ongi/admin/domain/service/ongi-admin-stats-policy';

describe('percentOf — 비율(%)은 소수 한 자리', () => {
  it('3명 중 1명은 33.3%', () => {
    expect(percentOf(1, 3)).toBe(33.3);
  });

  it('전부면 100, 없으면 0', () => {
    expect(percentOf(8, 8)).toBe(100);
    expect(percentOf(0, 8)).toBe(0);
  });

  it('모수가 0이면 0 — 0으로 나누지 않는다', () => {
    expect(percentOf(0, 0)).toBe(0);
    expect(percentOf(3, 0)).toBe(0);
  });
});

describe('averageOf — 평균', () => {
  it('기본은 정수로 반올림', () => {
    expect(averageOf(1800, 4)).toBe(450);
    expect(averageOf(100, 3)).toBe(33);
  });

  it('자릿수를 주면 그만큼 남긴다', () => {
    expect(averageOf(9, 4, 1)).toBe(2.3);
    expect(averageOf(23, 10, 1)).toBe(2.3);
  });

  it('개수가 0이면 0', () => {
    expect(averageOf(0, 0)).toBe(0);
    expect(averageOf(50, 0, 1)).toBe(0);
  });
});

describe('dayKeysUntil — 오늘까지 days 일, 오래된 날부터', () => {
  it('3일', () => {
    expect(dayKeysUntil('2026-09-29', 3)).toEqual(['2026-09-27', '2026-09-28', '2026-09-29']);
  });

  it('달이 넘어가는 구간', () => {
    expect(dayKeysUntil('2026-10-01', 3)).toEqual(['2026-09-29', '2026-09-30', '2026-10-01']);
  });
});

describe('buildRetention — 가입 1·7·30일 뒤 다시 온 비율', () => {
  it('기록이 있는 구간은 비율을 계산한다', () => {
    expect(buildRetention([{ days: 1, cohort: 4, retained: 3 }])[0]).toEqual({ days: 1, cohort: 4, retained: 3, rate: 75 });
  });

  it('항상 1 · 7 · 30일 순서로 세 줄 — 대상자가 없으면 비율은 null (0% 와 구분)', () => {
    expect(
      buildRetention([
        { days: 7, cohort: 0, retained: 0 },
        { days: 1, cohort: 4, retained: 3 },
      ]),
    ).toEqual([
      { days: 1, cohort: 4, retained: 3, rate: 75 },
      { days: 7, cohort: 0, retained: 0, rate: null },
      { days: 30, cohort: 0, retained: 0, rate: null },
    ]);
  });

  it('대상자는 있는데 아무도 안 왔으면 0%', () => {
    expect(buildRetention([{ days: 7, cohort: 5, retained: 0 }])[1]).toEqual({ days: 7, cohort: 5, retained: 0, rate: 0 });
  });
});

describe('buildStickiness — 하루 평균 접속자 ÷ 최근 30일 접속자', () => {
  const daily = [
    { day: '2026-09-23', activeUsers: 0 },
    { day: '2026-09-24', activeUsers: 0 },
    { day: '2026-09-25', activeUsers: 0 },
    { day: '2026-09-26', activeUsers: 0 },
    { day: '2026-09-27', activeUsers: 3 },
    { day: '2026-09-28', activeUsers: 5 },
    { day: '2026-09-29', activeUsers: 4 },
  ];

  it('기록을 시작한 날부터만 평균 낸다 — 3일 평균 4명 ÷ 6명 = 66.7%', () => {
    expect(buildStickiness(daily, 6, '2026-09-27')).toBe(66.7);
  });

  it('기록이 7일 넘게 쌓였으면 최근 7일 평균 — 12명 ÷ 7일 ÷ 6명 = 28.6%', () => {
    expect(buildStickiness(daily, 6, '2026-08-01')).toBe(28.6);
  });

  it('기록이 없으면 0', () => {
    expect(buildStickiness(daily, 0, null)).toBe(0);
  });
});
