import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Holy365CountBucket } from '@/holy365/transcription/domain/holy365-progress';

export interface Holy365VerseRecord {
  userId: number;
  versionCode: string;
  book: number;
  chapter: number;
  verse: number;
  chars: number;
  seconds: number;
  day: string;
}

export interface Holy365VersionCounts {
  versionCode: string;
  typed: number;
  minCount: number;
  lastBook: number | null;
  lastChapter: number | null;
  lastVerse: number | null;
  lastAt: Date | null;
}

export interface Holy365ChapterBucket extends Holy365CountBucket {
  book: number;
  chapter: number;
}

export interface Holy365DailyRow {
  day: string;
  verses: number;
  chars: number;
  seconds: number;
}

/** 같은 절을 이 시간 안에 다시 보내면 횟수를 올리지 않는다 (중복 전송·연타 방지) */
const DUPLICATE_WINDOW_SECONDS = 3;

@Injectable()
export class Holy365TranscriptionRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** 절 하나를 필사했다 — 횟수 +1, 마지막 위치, 하루 필사량. 중복 전송이면 false */
  async record(record: Holy365VerseRecord): Promise<boolean> {
    return this.dataSource.transaction(async manager => {
      const rows = await manager.query(
        `INSERT INTO holy365_verse_counts (user_id, version_code, book, chapter, verse, count)
         VALUES ($1, $2, $3, $4, $5, 1)
         ON CONFLICT (user_id, version_code, book, chapter, verse) DO UPDATE
            SET count = holy365_verse_counts.count + 1, last_at = now()
          WHERE holy365_verse_counts.last_at < now() - interval '${DUPLICATE_WINDOW_SECONDS} seconds'
         RETURNING count`,
        [record.userId, record.versionCode, record.book, record.chapter, record.verse],
      );
      if (!rows.length) return false;

      await manager.query(
        `INSERT INTO holy365_user_versions (user_id, version_code, last_book, last_chapter, last_verse)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, version_code) DO UPDATE
            SET last_book = EXCLUDED.last_book, last_chapter = EXCLUDED.last_chapter, last_verse = EXCLUDED.last_verse, updated_at = now()`,
        [record.userId, record.versionCode, record.book, record.chapter, record.verse],
      );
      await manager.query(
        `INSERT INTO holy365_daily_activity (user_id, day, verses, chars, seconds)
         VALUES ($1, $2, 1, $3, $4)
         ON CONFLICT (user_id, day) DO UPDATE
            SET verses = holy365_daily_activity.verses + 1,
                chars = holy365_daily_activity.chars + EXCLUDED.chars,
                seconds = holy365_daily_activity.seconds + EXCLUDED.seconds`,
        [record.userId, record.day, record.chars, record.seconds],
      );

      return true;
    });
  }

  chapterVerseCounts(userId: number, versionCode: string, book: number, chapter: number): Promise<{ verse: number; count: number }[]> {
    return this.dataSource.query(
      `SELECT verse::int AS verse, count::int AS count FROM holy365_verse_counts
        WHERE user_id = $1 AND version_code = $2 AND book = $3 AND chapter = $4 ORDER BY verse`,
      [userId, versionCode, book, chapter],
    );
  }

  /** 번역본별 쓴 절 수 · 가장 적게 쓴 횟수 · 마지막 위치 */
  versionCounts(userId: number): Promise<Holy365VersionCounts[]> {
    return this.dataSource.query(
      `SELECT c.version_code AS "versionCode", c.typed, c.min_count AS "minCount",
              uv.last_book::int AS "lastBook", uv.last_chapter::int AS "lastChapter", uv.last_verse::int AS "lastVerse", uv.updated_at AS "lastAt"
         FROM (SELECT version_code, COUNT(*)::int AS typed, MIN(count)::int AS min_count
                 FROM holy365_verse_counts WHERE user_id = $1 GROUP BY version_code) c
         LEFT JOIN holy365_user_versions uv ON uv.user_id = $1 AND uv.version_code = c.version_code`,
      [userId],
    );
  }

  async countAbove(userId: number, versionCode: string, threshold: number): Promise<number> {
    const rows = await this.dataSource.query(`SELECT COUNT(*)::int AS n FROM holy365_verse_counts WHERE user_id = $1 AND version_code = $2 AND count > $3`, [
      userId,
      versionCode,
      threshold,
    ]);

    return rows[0]?.n ?? 0;
  }

  /** 장마다 "n번 쓴 절이 몇 개" — 권·장 진행 현황 계산용 */
  chapterBuckets(userId: number, versionCode: string): Promise<Holy365ChapterBucket[]> {
    return this.dataSource.query(
      `SELECT book::int AS book, chapter::int AS chapter, count::int AS count, COUNT(*)::int AS n
         FROM holy365_verse_counts WHERE user_id = $1 AND version_code = $2
        GROUP BY book, chapter, count`,
      [userId, versionCode],
    );
  }

  daily(userId: number, sinceDay: string): Promise<Holy365DailyRow[]> {
    return this.dataSource.query(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day, verses, chars, seconds FROM holy365_daily_activity
        WHERE user_id = $1 AND day >= $2::date ORDER BY day`,
      [userId, sinceDay],
    );
  }

  async totals(userId: number): Promise<{ verses: number; chars: number; seconds: number; activeDays: string[] }> {
    const rows: Holy365DailyRow[] = await this.daily(userId, '1970-01-01');

    return {
      verses: rows.reduce((sum, row) => sum + row.verses, 0),
      chars: rows.reduce((sum, row) => sum + row.chars, 0),
      seconds: rows.reduce((sum, row) => sum + row.seconds, 0),
      activeDays: rows.map(row => row.day),
    };
  }
}
