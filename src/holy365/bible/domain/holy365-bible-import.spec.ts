import { parseBibleJson } from '@/holy365/bible/domain/holy365-bible-import';
import { HOLY365_BOOK_CHAPTERS } from '@/holy365/bible/domain/holy365-books';

/** 66권 · 정확한 장 수 · 장마다 절 2개인 가짜 성경 */
function fakeBooks(): { chapters: string[][] }[] {
  return HOLY365_BOOK_CHAPTERS.map((count, b) => ({
    chapters: Array.from({ length: count }, (_, c) => [`${b + 1}-${c + 1}-1`, `${b + 1}-${c + 1}-2`]),
  }));
}

describe('parseBibleJson — 성경 JSON 가져오기', () => {
  it('권 배열 [{ chapters: string[][] }] 형식', () => {
    const verses = parseBibleJson(fakeBooks());
    expect(verses.length).toBe(1189 * 2);
    expect(verses[0]).toEqual({ book: 1, chapter: 1, verse: 1, text: '1-1-1' });
    expect(verses[verses.length - 1]).toEqual({ book: 66, chapter: 22, verse: 2, text: '66-22-2' });
  });

  it('{ books: [...] } 로 감싼 형식', () => {
    expect(parseBibleJson({ books: fakeBooks() }).length).toBe(1189 * 2);
  });

  it('평평한 [{ book, chapter, verse, text }] 형식', () => {
    const flat = parseBibleJson([
      { book: 1, chapter: 1, verse: 1, text: ' 태초에 하나님이 천지를 창조하시니라 ' },
      { book: 1, chapter: 1, verse: 2, text: '땅이 혼돈하고' },
    ]);
    expect(flat).toEqual([
      { book: 1, chapter: 1, verse: 1, text: '태초에 하나님이 천지를 창조하시니라' },
      { book: 1, chapter: 1, verse: 2, text: '땅이 혼돈하고' },
    ]);
  });

  it('권 배열이 66권이 아니면 오류', () => {
    expect(() => parseBibleJson(fakeBooks().slice(0, 65))).toThrow('66');
  });

  it('장 수가 맞지 않으면 오류', () => {
    const books = fakeBooks();
    books[0].chapters.pop();
    expect(() => parseBibleJson(books)).toThrow('book 1');
  });

  it('평평한 형식에서 범위를 벗어난 장은 오류', () => {
    expect(() => parseBibleJson([{ book: 1, chapter: 51, verse: 1, text: 'x' }])).toThrow('1:51');
  });

  it('빈 절은 건너뛴다 (일부 번역본의 생략 절)', () => {
    const books = fakeBooks();
    books[0].chapters[0][1] = '   ';
    const verses = parseBibleJson(books);
    expect(verses.length).toBe(1189 * 2 - 1);
  });
});
