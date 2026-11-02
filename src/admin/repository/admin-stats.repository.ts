import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DailyRow } from '@/admin/domain/admin-stats.calculator';

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
}
