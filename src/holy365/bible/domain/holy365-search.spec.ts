import { likePattern, searchTerms } from '@/holy365/bible/domain/holy365-search';

describe('searchTerms — 검색어를 단어로 나눈다', () => {
  it('앞뒤·연속 공백을 정리하고 띄어 쓴 단어마다 나눈다', () => {
    expect(searchTerms('  사랑   오래 참고 ')).toEqual(['사랑', '오래', '참고']);
  });

  it('같은 단어는 한 번만, 최대 5개', () => {
    expect(searchTerms('빛 빛 어둠')).toEqual(['빛', '어둠']);
    expect(searchTerms('a b c d e f g')).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('조합형 한글도 완성형으로', () => {
    expect(searchTerms('사랑')).toEqual(['사랑']);
  });

  it('비었거나 너무 길면 빈 목록', () => {
    expect(searchTerms('   ')).toEqual([]);
    expect(searchTerms('가'.repeat(51))).toEqual([]);
  });
});

describe('likePattern — ILIKE 패턴 (특수문자는 글자 그대로)', () => {
  it('앞뒤에 % 를 붙인다', () => {
    expect(likePattern('사랑')).toBe('%사랑%');
  });

  it('% _ 백슬래시는 이스케이프', () => {
    expect(likePattern('100%')).toBe('%100\\%%');
    expect(likePattern('a_b')).toBe('%a\\_b%');
    expect(likePattern('a\\b')).toBe('%a\\\\b%');
  });
});
