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

  it('막힌 시도는 쿨다운을 연장하지 않는다 (첫 발송 기준 6시간)', () => {
    const throttle = new OngiLikePushThrottle();
    expect(throttle.shouldNotify(1, 10, 0)).toBe(true);
    expect(throttle.shouldNotify(1, 10, 5 * HOUR)).toBe(false);
    expect(throttle.shouldNotify(1, 10, 6 * HOUR)).toBe(true);
  });
});
