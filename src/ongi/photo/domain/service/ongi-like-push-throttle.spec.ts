import { OngiLikePushThrottle } from './ongi-like-push-throttle';

/**
 * 스펙 (사용자 합의 기대값):
 * 1) 처음 좋아요 → 푸시 발송
 * 2) 같은 사람·같은 사진 재좋아요 → 6시간 안에는 재발송 안 함
 * 3) 다른 사진·다른 사람 → 정상 발송
 * 4) 6시간이 지나면 다시 발송
 */
const HOUR = 60 * 60 * 1000;

describe('OngiLikePushThrottle', () => {
  it('처음 좋아요는 푸시를 보낸다', () => {
    const throttle = new OngiLikePushThrottle();
    expect(throttle.shouldNotify(1, 10, 0)).toBe(true);
  });

  it('같은 사람이 같은 사진에 다시 좋아요해도 6시간 안에는 보내지 않는다', () => {
    const throttle = new OngiLikePushThrottle();
    expect(throttle.shouldNotify(1, 10, 0)).toBe(true);
    expect(throttle.shouldNotify(1, 10, 1 * HOUR)).toBe(false);
    expect(throttle.shouldNotify(1, 10, 6 * HOUR - 1)).toBe(false);
  });

  it('다른 사진·다른 사람은 영향받지 않는다', () => {
    const throttle = new OngiLikePushThrottle();
    expect(throttle.shouldNotify(1, 10, 0)).toBe(true);
    expect(throttle.shouldNotify(2, 10, 0)).toBe(true); // 다른 사진
    expect(throttle.shouldNotify(1, 11, 0)).toBe(true); // 다른 사람
  });

  it('6시간이 지나면 다시 보낸다', () => {
    const throttle = new OngiLikePushThrottle();
    expect(throttle.shouldNotify(1, 10, 0)).toBe(true);
    expect(throttle.shouldNotify(1, 10, 6 * HOUR)).toBe(true);
  });

  it('상한 초과 시 만료 항목을 먼저 지우고, 그래도 넘치면 가장 오래된 것만 밀어낸다 (전체 초기화 금지)', () => {
    const throttle = new OngiLikePushThrottle(6 * HOUR, 2);
    expect(throttle.shouldNotify(1, 10, 0)).toBe(true);
    expect(throttle.shouldNotify(2, 10, 1000)).toBe(true);
    // 상한(2) 도달 상태에서 새 키 — 만료 없음 → 가장 오래된 (1,10) 만 밀려난다
    expect(throttle.shouldNotify(3, 10, 2000)).toBe(true);
    expect(throttle.shouldNotify(2, 10, 3000)).toBe(false); // (2,10) 은 살아 있어 여전히 차단
    expect(throttle.shouldNotify(1, 10, 4000)).toBe(true); // (1,10) 은 밀려났으므로 다시 발송
  });

  it('막힌 시도는 쿨다운을 연장하지 않는다 (첫 발송 기준 6시간)', () => {
    const throttle = new OngiLikePushThrottle();
    expect(throttle.shouldNotify(1, 10, 0)).toBe(true);
    expect(throttle.shouldNotify(1, 10, 5 * HOUR)).toBe(false);
    expect(throttle.shouldNotify(1, 10, 6 * HOUR)).toBe(true);
  });
});
