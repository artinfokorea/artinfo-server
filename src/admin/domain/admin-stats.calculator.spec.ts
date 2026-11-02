import { buildDailySeries, clampDays, kstDateString } from '@/admin/domain/admin-stats.calculator';

describe('kstDateString', () => {
  it('UTC 16:30 은 한국 시간으로 다음 날이다', () => {
    expect(kstDateString(new Date('2026-11-01T16:30:00Z'))).toBe('2026-11-02');
  });

  it('UTC 14:59 는 한국 시간으로 같은 날 23:59 다', () => {
    expect(kstDateString(new Date('2026-11-01T14:59:00Z'))).toBe('2026-11-01');
  });
});

describe('clampDays', () => {
  it('값이 없으면 30일', () => {
    expect(clampDays(undefined)).toBe(30);
  });

  it('7일보다 짧으면 7일, 90일보다 길면 90일', () => {
    expect(clampDays(0)).toBe(7);
    expect(clampDays(3)).toBe(7);
    expect(clampDays(500)).toBe(90);
  });

  it('범위 안이면 그대로 (소수는 버림)', () => {
    expect(clampDays(14)).toBe(14);
    expect(clampDays(14.8)).toBe(14);
  });

  it('숫자가 아니면 30일', () => {
    expect(clampDays(Number('abc'))).toBe(30);
  });
});

describe('buildDailySeries', () => {
  it('오늘까지 N일을 날짜순으로 만들고, 데이터가 없는 날은 0 으로 채운다', () => {
    const rows = [
      { date: '2026-11-01', metric: 'signups', count: 2 },
      { date: '2026-11-01', metric: 'activeUsers', count: 5 },
      { date: '2026-10-31', metric: 'jobs', count: 1 },
    ];

    expect(buildDailySeries(rows, 3, '2026-11-02')).toEqual([
      { date: '2026-10-31', signups: 0, activeUsers: 0, jobs: 1, posts: 0, comments: 0 },
      { date: '2026-11-01', signups: 2, activeUsers: 5, jobs: 0, posts: 0, comments: 0 },
      { date: '2026-11-02', signups: 0, activeUsers: 0, jobs: 0, posts: 0, comments: 0 },
    ]);
  });

  it('기간 밖의 날짜나 모르는 지표는 무시한다', () => {
    const rows = [
      { date: '2026-10-01', metric: 'signups', count: 9 },
      { date: '2026-11-02', metric: 'unknown', count: 9 },
      { date: '2026-11-02', metric: 'posts', count: 3 },
    ];

    expect(buildDailySeries(rows, 1, '2026-11-02')).toEqual([{ date: '2026-11-02', signups: 0, activeUsers: 0, jobs: 0, posts: 3, comments: 0 }]);
  });

  it('DB 가 count 를 문자열로 주어도 숫자로 바꾼다', () => {
    const rows = [{ date: '2026-11-02', metric: 'comments', count: '4' as unknown as number }];

    expect(buildDailySeries(rows, 1, '2026-11-02')[0].comments).toBe(4);
  });

  it('월이 바뀌는 구간도 빠짐없이 이어진다', () => {
    const dates = buildDailySeries([], 4, '2026-03-02').map(d => d.date);

    expect(dates).toEqual(['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02']);
  });
});
