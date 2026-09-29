import {
  kstDayKey,
  normalizeAppVersion,
  normalizePingSeconds,
  normalizePlatform,
  ONGI_ACTIVITY_MAX_PING_SECONDS,
  ONGI_ACTIVITY_TOUCH_INTERVAL_MS,
  shouldTouchActivity,
} from '@/ongi/activity/domain/service/ongi-activity-policy';

describe('kstDayKey — 하루의 경계는 한국 시간 자정', () => {
  it('UTC 14:59 는 한국 23:59 — 같은 날', () => {
    expect(kstDayKey(new Date('2026-09-29T14:59:59Z'))).toBe('2026-09-29');
  });

  it('UTC 15:00 는 한국 다음 날 00:00', () => {
    expect(kstDayKey(new Date('2026-09-29T15:00:00Z'))).toBe('2026-09-30');
  });

  it('달·해가 넘어가는 날', () => {
    expect(kstDayKey(new Date('2026-12-31T15:00:00Z'))).toBe('2027-01-01');
  });
});

describe('shouldTouchActivity — 접속 기록은 사용자당 5분에 한 번만 쓴다', () => {
  it('간격은 5분', () => {
    expect(ONGI_ACTIVITY_TOUCH_INTERVAL_MS).toBe(300000);
  });

  it('처음 보는 사용자는 기록한다', () => {
    expect(shouldTouchActivity(null, new Date('2026-09-29T03:00:00Z'))).toBe(true);
  });

  it('마지막 기록 뒤 5분이 안 지났으면 건너뛴다', () => {
    expect(shouldTouchActivity(new Date('2026-09-29T03:00:00Z'), new Date('2026-09-29T03:04:59Z'))).toBe(false);
  });

  it('5분이 지나면 다시 기록한다', () => {
    expect(shouldTouchActivity(new Date('2026-09-29T03:00:00Z'), new Date('2026-09-29T03:05:00Z'))).toBe(true);
  });

  it('5분이 안 지났어도 한국 날짜가 바뀌면 기록한다 — 새 날의 DAU 에 잡혀야 한다', () => {
    expect(shouldTouchActivity(new Date('2026-09-29T14:58:00Z'), new Date('2026-09-29T15:00:30Z'))).toBe(true);
  });
});

describe('normalizePingSeconds — 앱이 보낸 사용 시간(초)', () => {
  it('한 번에 받는 최대는 30분', () => {
    expect(ONGI_ACTIVITY_MAX_PING_SECONDS).toBe(1800);
  });

  it('정상 값은 그대로, 소수는 반올림', () => {
    expect(normalizePingSeconds(60)).toBe(60);
    expect(normalizePingSeconds(59.6)).toBe(60);
    expect(normalizePingSeconds(0)).toBe(0);
  });

  it('30분을 넘으면 30분으로 자른다', () => {
    expect(normalizePingSeconds(1801)).toBe(1800);
    expect(normalizePingSeconds(999999)).toBe(1800);
  });

  it('음수·숫자가 아닌 값은 0', () => {
    expect(normalizePingSeconds(-5)).toBe(0);
    expect(normalizePingSeconds(Number.NaN)).toBe(0);
    expect(normalizePingSeconds(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizePingSeconds('60')).toBe(0);
    expect(normalizePingSeconds(undefined)).toBe(0);
    expect(normalizePingSeconds(null)).toBe(0);
  });
});

describe('normalizePlatform · normalizeAppVersion', () => {
  it('ios · android 만 받는다 (대소문자 무시)', () => {
    expect(normalizePlatform('ios')).toBe('ios');
    expect(normalizePlatform('Android')).toBe('android');
    expect(normalizePlatform('web')).toBeNull();
    expect(normalizePlatform(undefined)).toBeNull();
    expect(normalizePlatform(3)).toBeNull();
  });

  it('버전은 숫자.숫자.숫자 형식만 받는다', () => {
    expect(normalizeAppVersion('1.0.10')).toBe('1.0.10');
    expect(normalizeAppVersion(' 1.0.10 ')).toBe('1.0.10');
    expect(normalizeAppVersion('1.0')).toBeNull();
    expect(normalizeAppVersion('1.0.10-beta')).toBeNull();
    expect(normalizeAppVersion("1.0.10'; DROP TABLE")).toBeNull();
    expect(normalizeAppVersion(undefined)).toBeNull();
  });
});
