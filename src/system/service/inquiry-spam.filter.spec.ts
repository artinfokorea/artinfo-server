import { detectInquirySpam, InquiryRateLimiter } from './inquiry-spam.filter';

/**
 * 기대값
 * - 사람이 쓴 문의(한글 제목·내용, 폼 연 지 수십 초 뒤)는 통과
 * - 허니팟이 채워지면 honeypot, 3초 안 제출은 too-fast, 영문자만 12자 이상 이어진 제목/내용은 random-*, 제목=내용(12자 이상)은 title-equals-contents
 * - 같은 IP 는 시간당 5건, 같은 이메일은 하루 3건까지
 */
describe('detectInquirySpam', () => {
  const base = {
    title: '광고 문의드립니다',
    contents: '배너 광고 단가가 궁금합니다. 연락 부탁드려요.',
    email: 'a@b.com',
    startedAt: 1_000_000,
    now: 1_030_000,
  };

  it('사람이 쓴 문의는 통과', () => {
    expect(detectInquirySpam(base)).toBeNull();
    expect(detectInquirySpam({ ...base, startedAt: undefined })).toBeNull(); // 앱처럼 startedAt 을 안 보내도 통과
    expect(detectInquirySpam({ ...base, title: 'Advertising inquiry', contents: 'Hello, I would like to ask about banner ads.' })).toBeNull();
  });

  it('봇 패턴은 막는다', () => {
    expect(detectInquirySpam({ ...base, website: 'http://spam.example' })).toBe('honeypot');
    expect(detectInquirySpam({ ...base, now: base.startedAt + 1500 })).toBe('too-fast');
    expect(detectInquirySpam({ ...base, title: 'yKhpAeIThWuyPraCaAUSV' })).toBe('random-title');
    expect(detectInquirySpam({ ...base, contents: 'jRHXbhtclgJOPmvLxdoXPGe' })).toBe('random-contents');
    expect(detectInquirySpam({ ...base, title: '같은 제목과 내용을 그대로 넣음', contents: '같은 제목과 내용을 그대로 넣음' })).toBe('title-equals-contents');
  });
});

describe('InquiryRateLimiter', () => {
  it('IP 시간당 5건, 이메일 하루 3건', () => {
    let now = 0;
    const limiter = new InquiryRateLimiter({ ipPerHour: 5, emailPerDay: 3 }, () => now);
    expect([1, 2, 3].map(i => limiter.allow('1.1.1.1', `u${i}@x.com`))).toEqual([true, true, true]);
    expect(limiter.allow('1.1.1.1', 'u4@x.com')).toBe(true);
    expect(limiter.allow('1.1.1.1', 'u5@x.com')).toBe(true);
    expect(limiter.allow('1.1.1.1', 'u6@x.com')).toBe(false); // IP 6번째
    now = 61 * 60 * 1000;
    expect(limiter.allow('1.1.1.1', 'u6@x.com')).toBe(true); // 한 시간 지나면 풀림
    expect(limiter.allow('2.2.2.2', 'same@x.com')).toBe(true);
    expect(limiter.allow('3.3.3.3', 'SAME@x.com')).toBe(true);
    expect(limiter.allow('4.4.4.4', 'same@x.com')).toBe(true);
    expect(limiter.allow('5.5.5.5', 'same@x.com')).toBe(false); // 이메일 4번째
  });
});
