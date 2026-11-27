import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface Holy365RankingRow {
  userId: number;
  name: string;
  iconImageUrl: string | null;
  verses: number;
  chars: number;
}

export interface Holy365PopularChapter {
  versionCode: string;
  book: number;
  chapter: number;
  writers: number;
}

/** 개발용 계정은 랭킹·통계에서 뺀다 */
const REAL_USERS = `u.deleted_at IS NULL AND u.sns_type <> 'dev'`;

@Injectable()
export class Holy365CommunityRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** 기간(시작일~오늘) 필사 절 수 합계 순위 */
  ranking(since: string, limit: number): Promise<Holy365RankingRow[]> {
    return this.dataSource.query(
      `SELECT u.id AS "userId", u.name, u.icon_image_url AS "iconImageUrl", SUM(a.verses)::int AS verses, SUM(a.chars)::int AS chars
         FROM holy365_daily_activity a
         JOIN holy365_users u ON u.id = a.user_id
        WHERE a.day >= $1::date AND ${REAL_USERS}
        GROUP BY u.id
       HAVING SUM(a.verses) > 0
        ORDER BY verses DESC, chars DESC, u.id
        LIMIT $2`,
      [since, limit],
    );
  }

  /** 내 순위 — 나보다 많이 쓴 사람 수 + 1 (기록이 없으면 null) */
  async myRank(userId: number, since: string): Promise<{ rank: number; verses: number } | null> {
    const rows = await this.dataSource.query(
      `WITH totals AS (
         SELECT a.user_id, SUM(a.verses)::int AS verses
           FROM holy365_daily_activity a JOIN holy365_users u ON u.id = a.user_id
          WHERE a.day >= $1::date AND ${REAL_USERS}
          GROUP BY a.user_id
       )
       SELECT me.verses, (SELECT COUNT(*)::int FROM totals t WHERE t.verses > me.verses) + 1 AS rank
         FROM totals me WHERE me.user_id = $2 AND me.verses > 0`,
      [since, userId],
    );

    return rows[0] ?? null;
  }

  async stats(today: string): Promise<{ todayWriters: number; todayVerses: number; totalWriters: number; totalVerses: number }> {
    const rows = await this.dataSource.query(
      `SELECT COUNT(DISTINCT a.user_id) FILTER (WHERE a.day = $1::date)::int AS "todayWriters",
              COALESCE(SUM(a.verses) FILTER (WHERE a.day = $1::date), 0)::int AS "todayVerses",
              COUNT(DISTINCT a.user_id)::int AS "totalWriters",
              COALESCE(SUM(a.verses), 0)::int AS "totalVerses"
         FROM holy365_daily_activity a JOIN holy365_users u ON u.id = a.user_id
        WHERE ${REAL_USERS}`,
      [today],
    );

    return rows[0];
  }

  /** 최근 7일 동안 가장 많은 사람이 쓴 장 */
  popularChapters(limit: number): Promise<Holy365PopularChapter[]> {
    return this.dataSource.query(
      `SELECT c.version_code AS "versionCode", c.book::int AS book, c.chapter::int AS chapter, COUNT(DISTINCT c.user_id)::int AS writers
         FROM holy365_verse_counts c JOIN holy365_users u ON u.id = c.user_id
        WHERE c.last_at >= now() - interval '7 days' AND ${REAL_USERS}
        GROUP BY c.version_code, c.book, c.chapter
        ORDER BY writers DESC, MAX(c.last_at) DESC
        LIMIT $1`,
      [limit],
    );
  }
}
