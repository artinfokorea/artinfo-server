import { dedupeKey, normalizeHost, normalizeTitle } from './competition-dedupe';

/**
 * 기대값: 회차·연도·괄호·기호·공백·법인 접두어가 달라도 같은 대회는 같은 키, 다른 대회는 다른 키
 */
describe('competition dedupe key', () => {
  it('제목 — 회차·연도·괄호·공백을 뗀다', () => {
    expect(normalizeTitle('제13회 수원시전국음악콩쿠르')).toBe('수원시전국음악콩쿠르');
    expect(normalizeTitle('2026 수원시 전국음악콩쿠르 (안)')).toBe('수원시전국음악콩쿠르');
    expect(normalizeTitle('2026년 하반기 음악교육신문 천안지사 콩쿠르')).toBe('음악교육신문천안지사콩쿠르');
    expect(normalizeTitle('The 6th NN Arts 전국 입시생 성악 콩쿠르')).toBe('thennarts전국입시생성악콩쿠르');
  });

  it('주최 — 법인 접두어·괄호를 뗀다', () => {
    expect(normalizeHost('(사)한국음악협회 수원시지부')).toBe('한국음악협회수원시지부');
    expect(normalizeHost('재단법인) 세종국제예술문화재단')).toBe('세종국제예술문화재단');
    expect(normalizeHost('주식회사 예술세계')).toBe('예술세계');
  });

  it('같은 대회는 같은 키, 다른 대회는 다른 키', () => {
    expect(dedupeKey('제13회 수원시전국음악콩쿠르', '(사)한국음악협회 수원시지부')).toBe(dedupeKey('2026 수원시 전국음악콩쿠르', '한국음악협회 수원시지부'));
    expect(dedupeKey('제13회 수원시전국음악콩쿠르', '한국음악협회 수원시지부')).not.toBe(dedupeKey('제13회 수원시전국음악콩쿠르', '수원시'));
    expect(dedupeKey('제9회 숭실음악콩쿠르 피아노 부문', '숭실대학교')).not.toBe(dedupeKey('제9회 숭실음악콩쿠르 성악 부문', '숭실대학교'));
  });
});
