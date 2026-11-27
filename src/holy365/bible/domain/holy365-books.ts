/** 개신교 정경 66권의 장 수 (창세기=1 … 요한계시록=66). 권 이름은 프론트가 언어별로 가진다 */
export const HOLY365_BOOK_CHAPTERS: readonly number[] = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24,
  21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22,
];

export const HOLY365_TOTAL_CHAPTERS = HOLY365_BOOK_CHAPTERS.reduce((sum, count) => sum + count, 0);

export function isValidChapter(book: number, chapter: number): boolean {
  if (!Number.isInteger(book) || !Number.isInteger(chapter)) return false;
  if (book < 1 || book > HOLY365_BOOK_CHAPTERS.length) return false;

  return chapter >= 1 && chapter <= HOLY365_BOOK_CHAPTERS[book - 1];
}
