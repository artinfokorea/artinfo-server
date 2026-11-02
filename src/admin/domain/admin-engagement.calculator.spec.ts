import { buildEngagementSeries, buildRetentionCohorts, mondayOf } from '@/admin/domain/admin-engagement.calculator';

describe('mondayOf', () => {
  it('그 주의 월요일 (한국 날짜 문자열 기준)', () => {
    expect(mondayOf('2026-11-04')).toBe('2026-11-02'); // 수 → 월
    expect(mondayOf('2026-11-02')).toBe('2026-11-02'); // 월 → 그대로
    expect(mondayOf('2026-11-08')).toBe('2026-11-02'); // 일 → 그 주 월
    expect(mondayOf('2026-03-01')).toBe('2026-02-23'); // 월 경계
  });
});

describe('buildRetentionCohorts', () => {
  // 첫 방문 주(월요일), 그 주에 처음 온 방문자 수, N주차(1~4)에 다시 온 방문자 수
  const rows = [
    { cohort: '2026-10-05', size: 10, week: 1, active: 4 },
    { cohort: '2026-10-05', size: 10, week: 2, active: 3 },
    { cohort: '2026-10-05', size: 10, week: 4, active: 1 },
    { cohort: '2026-10-26', size: 5, week: 1, active: 2 },
  ];

  it('최근 cohorts 개 주를 오래된 순으로, 주차별 재방문 비율(%)을 만든다', () => {
    const result = buildRetentionCohorts(rows, [], 4, '2026-11-02');

    expect(result).toEqual([
      { cohort: '2026-10-05', size: 10, weeks: [40, 30, 0, 10] },
      { cohort: '2026-10-12', size: 0, weeks: [null, null, null, null] },
      { cohort: '2026-10-19', size: 0, weeks: [null, null, null, null] },
      { cohort: '2026-10-26', size: 5, weeks: [40, null, null, null] },
    ]);
  });

  it('아직 오지 않은 주차는 null (첫 방문 주 + N주가 이번 주 이후)', () => {
    // 이번 주 월요일이 2026-11-02 → 10-26 첫 방문 주는 1주차(11-02 주)까지만 측정 가능
    const result = buildRetentionCohorts([{ cohort: '2026-10-26', size: 5, week: 1, active: 2 }], [], 1, '2026-11-02');

    expect(result[0].weeks).toEqual([40, null, null, null]);
  });

  it('첫 방문자는 있는데 재방문 기록이 없는 주차는 0%', () => {
    const result = buildRetentionCohorts([], [{ cohort: '2026-10-05', size: 3 }], 4, '2026-11-02');

    expect(result[0]).toEqual({ cohort: '2026-10-05', size: 3, weeks: [0, 0, 0, 0] });
  });

  it('비율은 소수 첫째 자리까지', () => {
    const result = buildRetentionCohorts([{ cohort: '2026-10-05', size: 3, week: 1, active: 1 }], [], 4, '2026-11-02');

    expect(result[0].weeks[0]).toBe(33.3);
  });
});

describe('buildEngagementSeries', () => {
  it('N일을 날짜순으로 채우고, 평균 체류시간은 그날 방문자 1명당 초(반올림)', () => {
    const rows = [
      { date: '2026-11-01', visitors: 3, members: 1, seconds: 100 },
      { date: '2026-11-02', visitors: '2' as unknown as number, members: 0, seconds: 0 },
    ];

    expect(buildEngagementSeries(rows, 3, '2026-11-02')).toEqual([
      { date: '2026-10-31', visitors: 0, members: 0, avgSeconds: 0 },
      { date: '2026-11-01', visitors: 3, members: 1, avgSeconds: 33 },
      { date: '2026-11-02', visitors: 2, members: 0, avgSeconds: 0 },
    ]);
  });
});
