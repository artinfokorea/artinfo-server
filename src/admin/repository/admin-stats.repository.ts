import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DailyRow } from '@/admin/domain/admin-stats.calculator';
import { EngagementRow, RetentionRow } from '@/admin/domain/admin-engagement.calculator';

/** DB 의 timestamp 는 UTC 로 저장되므로 +9시간 해서 한국 날짜로 묶는다 */
const KST_DATE = (column: string) => `to_char(${column} + interval '9 hours', 'YYYY-MM-DD')`;

export interface OverviewRow {
  users: number;
  users_7d: number;
  users_30d: number;
  active_users_7d: number;
  active_users_30d: number;
  jobs: number;
  active_jobs: number;
  jobs_7d: number;
  jobs_30d: number;
  lessons: number;
  performances: number;
  upcoming_performances: number;
  posts: number;
  posts_7d: number;
  posts_30d: number;
  comments: number;
  comments_7d: number;
  news: number;
  inquiries: number;
  inquiries_30d: number;
}

@Injectable()
export class AdminStatsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findUserForAdminCheck(userId: number): Promise<{ type: string; deletedAt: Date | null } | null> {
    const rows = await this.dataSource.query(`SELECT type, deleted_at AS "deletedAt" FROM users WHERE id = $1`, [userId]);
    return rows[0] ?? null;
  }

  async overview(): Promise<OverviewRow> {
    const [row] = await this.dataSource.query(`
      SELECT
        (SELECT count(*) FROM users WHERE deleted_at IS NULL)::int AS users,
        (SELECT count(*) FROM users WHERE deleted_at IS NULL AND created_at >= now() - interval '7 days')::int AS users_7d,
        (SELECT count(*) FROM users WHERE deleted_at IS NULL AND created_at >= now() - interval '30 days')::int AS users_30d,
        (SELECT count(DISTINCT user_id) FROM auths WHERE created_at >= now() - interval '7 days')::int AS active_users_7d,
        (SELECT count(DISTINCT user_id) FROM auths WHERE created_at >= now() - interval '30 days')::int AS active_users_30d,
        (SELECT count(*) FROM jobs)::int AS jobs,
        (SELECT count(*) FROM jobs WHERE is_active = true)::int AS active_jobs,
        (SELECT count(*) FROM jobs WHERE created_at >= now() - interval '7 days')::int AS jobs_7d,
        (SELECT count(*) FROM jobs WHERE created_at >= now() - interval '30 days')::int AS jobs_30d,
        (SELECT count(*) FROM lessons)::int AS lessons,
        (SELECT count(*) FROM performances)::int AS performances,
        (SELECT count(*) FROM performances WHERE end_at >= now())::int AS upcoming_performances,
        (SELECT count(*) FROM posts WHERE deleted_at IS NULL)::int AS posts,
        (SELECT count(*) FROM posts WHERE deleted_at IS NULL AND created_at >= now() - interval '7 days')::int AS posts_7d,
        (SELECT count(*) FROM posts WHERE deleted_at IS NULL AND created_at >= now() - interval '30 days')::int AS posts_30d,
        (SELECT count(*) FROM comments)::int AS comments,
        (SELECT count(*) FROM comments WHERE created_at >= now() - interval '7 days')::int AS comments_7d,
        (SELECT count(*) FROM news)::int AS news,
        (SELECT count(*) FROM inquiries)::int AS inquiries,
        (SELECT count(*) FROM inquiries WHERE created_at >= now() - interval '30 days')::int AS inquiries_30d
    `);
    return row;
  }

  /** 최근 days 일(한국 날짜 기준)의 일별 지표. 지표마다 한 줄씩 (date, metric, count) */
  async daily(days: number): Promise<DailyRow[]> {
    const since = `now() - interval '${days + 1} days'`;
    return this.dataSource.query(
      `
      SELECT ${KST_DATE('created_at')} AS date, 'signups' AS metric, count(*)::int AS count
        FROM users WHERE created_at >= ${since} GROUP BY 1
      UNION ALL
      SELECT ${KST_DATE('created_at')}, 'activeUsers', count(DISTINCT user_id)::int
        FROM auths WHERE created_at >= ${since} GROUP BY 1
      UNION ALL
      SELECT ${KST_DATE('created_at')}, 'jobs', count(*)::int
        FROM jobs WHERE created_at >= ${since} GROUP BY 1
      UNION ALL
      SELECT ${KST_DATE('created_at')}, 'posts', count(*)::int
        FROM posts WHERE deleted_at IS NULL AND created_at >= ${since} GROUP BY 1
      UNION ALL
      SELECT ${KST_DATE('created_at')}, 'comments', count(*)::int
        FROM comments WHERE created_at >= ${since} GROUP BY 1
      `,
    );
  }

  /** 최근 30일 로그인 방식별 로그인한 사용자 수 */
  async loginsByType(): Promise<{ type: string; count: number }[]> {
    return this.dataSource.query(`
      SELECT type, count(DISTINCT user_id)::int AS count
        FROM auths WHERE created_at >= now() - interval '30 days'
       GROUP BY type ORDER BY count DESC
    `);
  }

  async jobsByType(): Promise<{ type: string; count: number }[]> {
    return this.dataSource.query(`
      SELECT type, count(*)::int AS count FROM jobs WHERE is_active = true GROUP BY type ORDER BY count DESC
    `);
  }

  async recentUsers(limit: number): Promise<{ id: number; nickname: string; email: string; createdAt: Date }[]> {
    return this.dataSource.query(
      `SELECT id, nickname, email, created_at AS "createdAt" FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
  }

  async topPosts(limit: number): Promise<{ id: number; title: string; viewCount: number; createdAt: Date }[]> {
    return this.dataSource.query(
      `SELECT id, title, view_count AS "viewCount", created_at AS "createdAt"
         FROM posts WHERE deleted_at IS NULL AND created_at >= now() - interval '30 days'
        ORDER BY view_count DESC LIMIT $1`,
      [limit],
    );
  }

  async recentInquiries(limit: number): Promise<{ id: number; title: string; email: string; createdAt: Date }[]> {
    return this.dataSource.query(`SELECT id, title, email, created_at AS "createdAt" FROM inquiries ORDER BY created_at DESC LIMIT $1`, [limit]);
  }

  /* ---------- 방문자 활동 (artinfo_visitor_daily_activity, day 는 한국 날짜) ---------- */

  /** 한국 오늘 기준 1일(오늘)·7일·30일 고유 방문자/회원 수와 7일 평균 체류 초 */
  async engagementSummary(): Promise<{
    dau: number;
    wau: number;
    mau: number;
    member_dau: number;
    member_wau: number;
    member_mau: number;
    avg_seconds_7d: number;
  }> {
    const [row] = await this.dataSource.query(`
      WITH t AS (SELECT (now() AT TIME ZONE 'Asia/Seoul')::date AS today)
      SELECT
        count(DISTINCT visitor_id) FILTER (WHERE day = t.today)::int AS dau,
        count(DISTINCT visitor_id) FILTER (WHERE day > t.today - 7)::int AS wau,
        count(DISTINCT visitor_id)::int AS mau,
        count(DISTINCT user_id) FILTER (WHERE day = t.today)::int AS member_dau,
        count(DISTINCT user_id) FILTER (WHERE day > t.today - 7)::int AS member_wau,
        count(DISTINCT user_id)::int AS member_mau,
        COALESCE(round(avg(active_seconds) FILTER (WHERE day > t.today - 7)), 0)::int AS avg_seconds_7d
      FROM artinfo_visitor_daily_activity, t
      WHERE day > t.today - 30
    `);
    return row;
  }

  async engagementDaily(days: number): Promise<EngagementRow[]> {
    return this.dataSource.query(
      `SELECT to_char(day, 'YYYY-MM-DD') AS date,
              count(DISTINCT visitor_id)::int AS visitors,
              count(DISTINCT user_id)::int AS members,
              COALESCE(sum(active_seconds), 0)::int AS seconds
         FROM artinfo_visitor_daily_activity
        WHERE day > (now() AT TIME ZONE 'Asia/Seoul')::date - $1::int
        GROUP BY day`,
      [days],
    );
  }

  /** 첫 방문 주(월요일)별 방문자 수와 1~4주차 재방문 수. since 이후 첫 방문 주만 */
  async retention(since: string): Promise<{ rows: RetentionRow[]; sizes: { cohort: string; size: number }[] }> {
    const firstVisits = `
      WITH first AS (
        SELECT visitor_id, date_trunc('week', min(day))::date AS cohort
          FROM artinfo_visitor_daily_activity GROUP BY visitor_id
      ),
      sizes AS (
        SELECT cohort, count(*)::int AS size FROM first WHERE cohort >= $1::date GROUP BY cohort
      )`;
    const rows = await this.dataSource.query(
      `${firstVisits}
       SELECT to_char(f.cohort, 'YYYY-MM-DD') AS cohort, s.size,
              ((date_trunc('week', a.day)::date - f.cohort) / 7)::int AS week,
              count(DISTINCT a.visitor_id)::int AS active
         FROM artinfo_visitor_daily_activity a
         JOIN first f USING (visitor_id)
         JOIN sizes s ON s.cohort = f.cohort
        WHERE (date_trunc('week', a.day)::date - f.cohort) / 7 BETWEEN 1 AND 4
        GROUP BY f.cohort, s.size, week`,
      [since],
    );
    const sizes = await this.dataSource.query(`${firstVisits} SELECT to_char(cohort, 'YYYY-MM-DD') AS cohort, size FROM sizes`, [since]);
    return { rows, sizes };
  }
}
