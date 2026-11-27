import { isTypedMatch, normalizeVerseText } from '@/holy365/transcription/domain/holy365-typing';

describe('normalizeVerseText — 비교용 본문 정규화', () => {
  it('앞뒤 공백을 걷고 연속 공백·줄바꿈은 한 칸으로', () => {
    expect(normalizeVerseText('  태초에   하나님이\n천지를  ')).toBe('태초에 하나님이 천지를');
  });

  it('둥근 따옴표는 곧은 따옴표로 바꾼다 (키보드로 치기 어렵다)', () => {
    expect(normalizeVerseText('“빛이 있으라” 하시니 ‘빛’')).toBe('"빛이 있으라" 하시니 \'빛\'');
  });

  it('전각·줄바꿈 없는 공백도 일반 공백으로', () => {
    expect(normalizeVerseText('가 나　다')).toBe('가 나 다');
  });

  it('조합형 한글(NFD)도 완성형(NFC)과 같게 본다', () => {
    expect(normalizeVerseText('한')).toBe('한');
  });
});

describe('isTypedMatch — 필사 일치 판정', () => {
  it('정규화 후 같으면 일치', () => {
    expect(isTypedMatch('태초에 하나님이 천지를 창조하시니라', ' 태초에  하나님이 천지를 창조하시니라 ')).toBe(true);
    expect(isTypedMatch('And God said, “Let there be light”', 'And God said, "Let there be light"')).toBe(true);
  });

  it('글자가 하나라도 다르면 불일치', () => {
    expect(isTypedMatch('태초에 하나님이 천지를 창조하시니라', '태초에 하나님이 천지를 창조하시니')).toBe(false);
    expect(isTypedMatch('In the beginning God', 'in the beginning God')).toBe(false);
  });

  it('빈 입력은 불일치', () => {
    expect(isTypedMatch('태초에', '')).toBe(false);
    expect(isTypedMatch('', '')).toBe(false);
  });
});
