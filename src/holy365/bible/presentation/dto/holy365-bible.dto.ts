import { ApiProperty } from '@nestjs/swagger';
import { Holy365ChapterRow, Holy365VerseRow, Holy365VersionRow } from '@/holy365/bible/infrastructure/holy365-bible.repository';

export class Holy365VersionResponse {
  @ApiProperty({ example: 'NKRV' })
  code: string;

  @ApiProperty({ example: '개역개정' })
  name: string;

  @ApiProperty({ example: 'ko' })
  language: string;

  @ApiProperty()
  copyright: string;

  @ApiProperty()
  verseCount: number;

  @ApiProperty()
  chapterCount: number;

  constructor(row: Holy365VersionRow) {
    Object.assign(this, row);
  }
}

export class Holy365VersionListResponse {
  @ApiProperty({ type: [Holy365VersionResponse] })
  versions: Holy365VersionResponse[];

  constructor(rows: Holy365VersionRow[]) {
    this.versions = rows.map(row => new Holy365VersionResponse(row));
  }
}

export class Holy365BookResponse {
  @ApiProperty({ description: '1(창세기) ~ 66(요한계시록)' })
  book: number;

  @ApiProperty({ type: [Number], description: '장마다 절 수 (index 0 = 1장)' })
  verseCounts: number[];
}

export class Holy365BookListResponse {
  @ApiProperty({ type: [Holy365BookResponse] })
  books: Holy365BookResponse[];

  constructor(rows: Holy365ChapterRow[]) {
    const byBook = new Map<number, number[]>();
    rows.forEach(row => byBook.set(row.book, [...(byBook.get(row.book) ?? []), row.verseCount]));
    this.books = [...byBook.entries()].map(([book, verseCounts]) => ({ book, verseCounts }));
  }
}

export class Holy365ChapterTextResponse {
  @ApiProperty()
  versionCode: string;

  @ApiProperty()
  book: number;

  @ApiProperty()
  chapter: number;

  @ApiProperty({ type: 'array', items: { type: 'object', properties: { verse: { type: 'number' }, text: { type: 'string' } } } })
  verses: Holy365VerseRow[];

  constructor(versionCode: string, book: number, chapter: number, verses: Holy365VerseRow[]) {
    this.versionCode = versionCode;
    this.book = book;
    this.chapter = chapter;
    this.verses = verses;
  }
}
