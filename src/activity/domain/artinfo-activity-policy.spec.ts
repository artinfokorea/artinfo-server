import { isValidVisitorId, normalizeActiveSeconds, ARTINFO_ACTIVITY_MAX_PING_SECONDS } from '@/activity/domain/artinfo-activity-policy';

describe('normalizeActiveSeconds', () => {
  it('양의 정수는 그대로', () => {
    expect(normalizeActiveSeconds(60)).toBe(60);
  });

  it('소수는 반올림', () => {
    expect(normalizeActiveSeconds(59.6)).toBe(60);
  });

  it('한 번에 30분(1800초)까지만 받는다', () => {
    expect(ARTINFO_ACTIVITY_MAX_PING_SECONDS).toBe(1800);
    expect(normalizeActiveSeconds(99999)).toBe(1800);
  });

  it('0·음수·숫자가 아닌 값은 0', () => {
    expect(normalizeActiveSeconds(0)).toBe(0);
    expect(normalizeActiveSeconds(-5)).toBe(0);
    expect(normalizeActiveSeconds('60')).toBe(0);
    expect(normalizeActiveSeconds(undefined)).toBe(0);
    expect(normalizeActiveSeconds(Number.NaN)).toBe(0);
    expect(normalizeActiveSeconds(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('isValidVisitorId', () => {
  it('브라우저가 만든 UUID(v4) 는 통과', () => {
    expect(isValidVisitorId('3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b')).toBe(true);
    expect(isValidVisitorId('3F2B8C1E-9A4D-4E6F-8B2A-1C3D5E7F9A0B')).toBe(true);
  });

  it('형식이 다르면 거부 (임의 문자열로 행을 늘리지 못하게)', () => {
    expect(isValidVisitorId('hello')).toBe(false);
    expect(isValidVisitorId('3f2b8c1e-9a4d-1e6f-8b2a-1c3d5e7f9a0b')).toBe(false); // v1
    expect(isValidVisitorId('3f2b8c1e9a4d4e6f8b2a1c3d5e7f9a0b')).toBe(false);
    expect(isValidVisitorId(undefined)).toBe(false);
    expect(isValidVisitorId(123)).toBe(false);
  });
});
