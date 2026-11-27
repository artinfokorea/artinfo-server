import { periodStart, rankRows } from '@/holy365/community/domain/holy365-period';

describe('periodStart — 랭킹 기간 시작일 (한국 날짜)', () => {
  it('일간은 오늘', () => {
    expect(periodStart('day', '2026-11-27')).toBe('2026-11-27');
  });

  it('주간은 이번 주 월요일 (2026-11-27 은 금요일)', () => {
    expect(periodStart('week', '2026-11-27')).toBe('2026-11-23');
  });

  it('월요일이면 그날, 일요일이면 6일 전 월요일', () => {
    expect(periodStart('week', '2026-11-23')).toBe('2026-11-23');
    expect(periodStart('week', '2026-11-29')).toBe('2026-11-23');
  });

  it('주간이 달을 넘어간다 (2026-12-02 수요일 → 11-30)', () => {
    expect(periodStart('week', '2026-12-02')).toBe('2026-11-30');
  });

  it('월간은 이번 달 1일', () => {
    expect(periodStart('month', '2026-11-27')).toBe('2026-11-01');
  });
});

describe('rankRows — 동점은 같은 순위, 다음 순위는 건너뛴다', () => {
  it('절 수 내림차순으로 순위', () => {
    expect(rankRows([{ verses: 30 }, { verses: 20 }, { verses: 20 }, { verses: 5 }]).map(r => r.rank)).toEqual([1, 2, 2, 4]);
  });

  it('빈 목록', () => {
    expect(rankRows([])).toEqual([]);
  });
});
