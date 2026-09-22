import { OnchurchCustomDomainError, counterpartHost, normalizeCustomDomain } from '@/onchurch/church/application/service/onchurch-custom-domain';

describe('normalizeCustomDomain', () => {
  it('주소창에서 복사한 전체 URL 에서 호스트만 남긴다', () => {
    expect(normalizeCustomDomain('https://WWW.Example.com/home?a=1')).toBe('www.example.com');
  });

  it('포트·후행 점·공백을 정리한다', () => {
    expect(normalizeCustomDomain('  Example.co.kr.:443 ')).toBe('example.co.kr');
  });

  it('빈 값이면 null(연결 해제)', () => {
    expect(normalizeCustomDomain('')).toBeNull();
    expect(normalizeCustomDomain('   ')).toBeNull();
    expect(normalizeCustomDomain(null)).toBeNull();
  });

  it('호스트명 형식이 아니면 거부한다', () => {
    expect(() => normalizeCustomDomain('example')).toThrow(OnchurchCustomDomainError);
    expect(() => normalizeCustomDomain('한글도메인.한국')).toThrow(OnchurchCustomDomainError);
  });

  it('punycode 로 변환된 한글 도메인은 허용한다', () => {
    expect(normalizeCustomDomain('xn--hq1bm8jm9l.xn--3e0b707e')).toBe('xn--hq1bm8jm9l.xn--3e0b707e');
  });

  it('온교회 서비스 도메인은 자체 도메인으로 등록할 수 없다', () => {
    expect(() => normalizeCustomDomain('eunseok.everychurch.co.kr')).toThrow(OnchurchCustomDomainError);
    expect(() => normalizeCustomDomain('onchurch.kr')).toThrow(OnchurchCustomDomainError);
  });
});

describe('counterpartHost', () => {
  it('www 가 붙어 있으면 떼고, 없으면 붙인다', () => {
    expect(counterpartHost('www.example.com')).toBe('example.com');
    expect(counterpartHost('example.com')).toBe('www.example.com');
  });

  it('라벨이 3개인 국내 apex 도메인도 www 짝을 만든다', () => {
    expect(counterpartHost('example.co.kr')).toBe('www.example.co.kr');
  });
});
