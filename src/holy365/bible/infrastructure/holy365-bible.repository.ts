import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface Holy365VersionRow {
  code: string;
  name: string;
  language: string;
  copyright: string;
  verseCount: number;
  chapterCount: number;
}

export interface Holy365ChapterRow {
  book: number;
  chapter: number;
  verseCount: number;
}

export interface Holy365VerseRow {
  verse: number;
  text: string;
}

export interface Holy365VerseHit {
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

const CACHE_MS = 10 * 60 * 1000;

/** 성경 본문은 거의 바뀌지 않으므로 번역본·장 목록은 서버 메모리에 10분 캐시한다 */
@Injectable()
export class Holy365BibleRepository {
  private versionsCache: { at: number; rows: Holy365VersionRow[] } | null = null;
  private chaptersCache = new Map<string, { at: number; rows: Holy365ChapterRow[] }>();

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async versions(): Promise<Holy365VersionRow[]> {
    if (this.versionsCache && Date.now() - this.versionsCache.at < CACHE_MS) return this.versionsCache.rows;

    const rows = await this.dataSource.query(
      `SELECT v.code, v.name, v.language, v.copyright,
              SUM(c.verse_count)::int AS "verseCount", COUNT(c.chapter)::int AS "chapterCount"
         FROM holy365_bible_versions v
         JOIN holy365_chapters c ON c.version_code = v.code
        WHERE v.is_active
        GROUP BY v.code
        ORDER BY v.sort, v.code`,
    );
    this.versionsCache = { at: Date.now(), rows };

    return rows;
  }

  async findVersion(code: string): Promise<Holy365VersionRow | null> {
    return (await this.versions()).find(version => version.code === code) ?? null;
  }

  async chapters(code: string): Promise<Holy365ChapterRow[]> {
    const cached = this.chaptersCache.get(code);
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.rows;

    const rows = await this.dataSource.query(
      `SELECT book::int AS book, chapter::int AS chapter, verse_count::int AS "verseCount"
         FROM holy365_chapters WHERE version_code = $1 ORDER BY book, chapter`,
      [code],
    );
    this.chaptersCache.set(code, { at: Date.now(), rows });

    return rows;
  }

  async verseCountOf(code: string, book: number, chapter: number): Promise<number> {
    return (await this.chapters(code)).find(row => row.book === book && row.chapter === chapter)?.verseCount ?? 0;
  }

  verses(code: string, book: number, chapter: number): Promise<Holy365VerseRow[]> {
    return this.dataSource.query(`SELECT verse::int AS verse, text FROM holy365_verses WHERE version_code = $1 AND book = $2 AND chapter = $3 ORDER BY verse`, [
      code,
      book,
      chapter,
    ]);
  }

  /** 본문 검색 — 모든 패턴이 들어간 절 (권·장·절 순). 번역본당 31,000절 정도라 인덱스 없이도 수 ms */
  async search(code: string, patterns: string[], limit: number, offset: number): Promise<{ total: number; hits: Holy365VerseHit[] }> {
    const conditions = patterns.map((_, index) => `text ILIKE $${index + 2}`).join(' AND ');
    const params: (string | number)[] = [code, ...patterns];
    const [count] = await this.dataSource.query(`SELECT COUNT(*)::int AS total FROM holy365_verses WHERE version_code = $1 AND ${conditions}`, params);
    const hits = await this.dataSource.query(
      `SELECT book::int AS book, chapter::int AS chapter, verse::int AS verse, text FROM holy365_verses
        WHERE version_code = $1 AND ${conditions}
        ORDER BY book, chapter, verse LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    return { total: count?.total ?? 0, hits };
  }

  async verse(code: string, book: number, chapter: number, verse: number): Promise<string | null> {
    const rows = await this.dataSource.query(`SELECT text FROM holy365_verses WHERE version_code = $1 AND book = $2 AND chapter = $3 AND verse = $4`, [
      code,
      book,
      chapter,
      verse,
    ]);

    return rows[0]?.text ?? null;
  }
}
