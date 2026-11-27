import { HOLY365_BOOK_CHAPTERS, HOLY365_TOTAL_CHAPTERS, isValidChapter } from '@/holy365/bible/domain/holy365-books';

describe('성경 66권 장 수', () => {
  it('66권, 1189장 (구약 929 · 신약 260)', () => {
    expect(HOLY365_BOOK_CHAPTERS.length).toBe(66);
    expect(HOLY365_TOTAL_CHAPTERS).toBe(1189);
    expect(HOLY365_BOOK_CHAPTERS.slice(0, 39).reduce((a, b) => a + b, 0)).toBe(929);
  });

  it('창세기 50장, 시편 150장, 요한계시록 22장', () => {
    expect(HOLY365_BOOK_CHAPTERS[0]).toBe(50);
    expect(HOLY365_BOOK_CHAPTERS[18]).toBe(150);
    expect(HOLY365_BOOK_CHAPTERS[65]).toBe(22);
  });
});

describe('isValidChapter — 권(1~66)·장 범위', () => {
  it('범위 안이면 true', () => {
    expect(isValidChapter(1, 1)).toBe(true);
    expect(isValidChapter(1, 50)).toBe(true);
    expect(isValidChapter(66, 22)).toBe(true);
  });

  it('범위 밖이면 false', () => {
    expect(isValidChapter(0, 1)).toBe(false);
    expect(isValidChapter(67, 1)).toBe(false);
    expect(isValidChapter(1, 51)).toBe(false);
    expect(isValidChapter(1, 0)).toBe(false);
    expect(isValidChapter(1.5, 1)).toBe(false);
  });
});
