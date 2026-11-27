import { normalizeEmail, normalizePhone, parseHomepage, sameLead, toLeadInput } from '@/onchurch/sales/sales-lead';

/**
 * 영업 대상 값 정리
 * - 전화: 숫자만 모아 지역번호 꼴로(02 / 031 / 010), 이상한 값은 원문 유지
 * - 이메일: 소문자, 꼴이 아니면 버림
 * - 홈페이지: '없음'·'블로그'·주소로 상태를 정함
 * - 같은 교회: 이름(공백 무시) + 전화 또는 주소
 */
describe('sales-lead', () => {
  it('전화번호를 정리한다', () => {
    expect(normalizePhone('0212345678')).toBe('02-1234-5678');
    expect(normalizePhone('02 123 4567')).toBe('02-123-4567');
    expect(normalizePhone('(031)123-4567')).toBe('031-123-4567');
    expect(normalizePhone('010.1234.5678')).toBe('010-1234-5678');
    expect(normalizePhone('1588-0000')).toBe('1588-0000');
    expect(normalizePhone('  ')).toBeNull();
  });

  it('이메일은 소문자, 꼴이 아니면 null', () => {
    expect(normalizeEmail(' Church@Naver.COM ')).toBe('church@naver.com');
    expect(normalizeEmail('mailto:a@b.kr')).toBe('a@b.kr');
    expect(normalizeEmail('없음')).toBeNull();
  });

  it('홈페이지 상태를 정한다', () => {
    expect(parseHomepage('홈페이지가 없습니다', null)).toEqual({ homepageStatus: 'none', homepageUrl: null });
    expect(parseHomepage('', 'https://blog.naver.com/abc')).toEqual({ homepageStatus: 'blog', homepageUrl: 'https://blog.naver.com/abc' });
    expect(parseHomepage(null, 'http://abc.or.kr')).toEqual({ homepageStatus: 'has', homepageUrl: 'http://abc.or.kr' });
    expect(parseHomepage('old', 'http://abc.or.kr')).toEqual({ homepageStatus: 'old', homepageUrl: 'http://abc.or.kr' });
    expect(parseHomepage(null, null)).toEqual({ homepageStatus: 'unknown', homepageUrl: null });
  });

  it('이름이 없으면 null, 상태가 이상하면 new', () => {
    expect(toLeadInput({ name: '  ' })).toBeNull();
    expect(toLeadInput({ name: '사랑교회', status: 'weird', phone: '0311234567', homepageStatus: '없음' })).toEqual({
      name: '사랑교회',
      denomination: null,
      region: null,
      address: null,
      pastor: null,
      phone: '031-123-4567',
      email: null,
      homepageStatus: 'none',
      homepageUrl: null,
      source: null,
      status: 'new',
      emailConsent: false,
      memo: null,
    });
  });

  it('같은 교회 판단', () => {
    expect(sameLead({ name: '사랑 교회', phone: '031-123-4567', address: null }, { name: '사랑교회', phone: '0311234567', address: '수원' })).toBe(true);
    expect(sameLead({ name: '사랑교회', phone: null, address: '수원시 1' }, { name: '사랑교회', phone: null, address: '수원시 1' })).toBe(true);
    expect(sameLead({ name: '사랑교회', phone: '031-111-1111', address: null }, { name: '사랑교회', phone: '02-222-2222', address: null })).toBe(false);
    expect(sameLead({ name: '사랑교회', phone: null, address: null }, { name: '소망교회', phone: null, address: null })).toBe(false);
  });
});
