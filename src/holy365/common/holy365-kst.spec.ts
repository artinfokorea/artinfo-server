import { kstDateOf, kstDaysAgo } from '@/holy365/common/holy365-kst';

describe('kstDateOf — 한국 시간 날짜', () => {
  it('UTC 15:00 이후는 한국에서 다음 날이다', () => {
    expect(kstDateOf(new Date('2026-11-27T14:59:59Z'))).toBe('2026-11-27');
    expect(kstDateOf(new Date('2026-11-27T15:00:00Z'))).toBe('2026-11-28');
  });

  it('연말 경계도 넘긴다', () => {
    expect(kstDateOf(new Date('2026-12-31T16:00:00Z'))).toBe('2027-01-01');
  });
});

describe('kstDaysAgo — n일 전 한국 날짜', () => {
  it('0일 전은 오늘, 1일 전은 어제', () => {
    const now = new Date('2026-03-01T01:00:00Z');
    expect(kstDaysAgo(0, now)).toBe('2026-03-01');
    expect(kstDaysAgo(1, now)).toBe('2026-02-28');
  });
});
