import { HOLY365_BOOK_CHAPTERS, isValidChapter } from '@/holy365/bible/domain/holy365-books';

export interface Holy365ParsedVerse {
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

interface BookShape {
  chapters: unknown[];
}

function isBookArray(value: unknown): value is BookShape[] {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && Array.isArray((value[0] as BookShape).chapters);
}

function fromBooks(books: BookShape[]): Holy365ParsedVerse[] {
  if (books.length !== HOLY365_BOOK_CHAPTERS.length) throw new Error(`expected 66 books, got ${books.length}`);

  const verses: Holy365ParsedVerse[] = [];
  books.forEach((book, bookIndex) => {
    const expected = HOLY365_BOOK_CHAPTERS[bookIndex];
    if (book.chapters.length !== expected) throw new Error(`book ${bookIndex + 1}: expected ${expected} chapters, got ${book.chapters.length}`);

    book.chapters.forEach((chapter, chapterIndex) => {
      if (!Array.isArray(chapter)) throw new Error(`book ${bookIndex + 1} chapter ${chapterIndex + 1} is not an array`);
      chapter.forEach((text, verseIndex) => {
        const trimmed = String(text ?? '').trim();
        if (!trimmed) return;
        verses.push({ book: bookIndex + 1, chapter: chapterIndex + 1, verse: verseIndex + 1, text: trimmed });
      });
    });
  });

  return verses;
}

function fromFlat(rows: unknown[]): Holy365ParsedVerse[] {
  return rows
    .map(row => {
      const { book, chapter, verse, text } = row as Record<string, unknown>;
      const parsed = { book: Number(book), chapter: Number(chapter), verse: Number(verse), text: String(text ?? '').trim() };
      if (!isValidChapter(parsed.book, parsed.chapter) || !Number.isInteger(parsed.verse) || parsed.verse < 1) {
        throw new Error(`invalid reference ${parsed.book}:${parsed.chapter}:${parsed.verse}`);
      }

      return parsed;
    })
    .filter(verse => verse.text.length > 0);
}

/**
 * 성경 본문 JSON 을 절 목록으로 바꾼다. 지원 형식:
 *  1) [{ chapters: string[][] }] × 66 (권 순서대로)
 *  2) { books: 1) 형식 }
 *  3) [{ book, chapter, verse, text }] (book 1~66)
 */
export function parseBibleJson(raw: unknown): Holy365ParsedVerse[] {
  const source =
    raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray((raw as { books?: unknown }).books) ? (raw as { books: unknown[] }).books : raw;

  if (isBookArray(source)) return fromBooks(source);
  if (Array.isArray(source)) return fromFlat(source);

  throw new Error('unsupported bible json format');
}
