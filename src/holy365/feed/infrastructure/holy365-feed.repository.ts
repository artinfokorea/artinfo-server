import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Holy365Aspect } from '@/holy365/feed/domain/holy365-post-policy';

export interface Holy365PostVerse {
  versionCode: string;
  book: number;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  text: string;
}

export interface Holy365PostRow {
  id: number;
  userId: number;
  name: string;
  iconImageUrl: string | null;
  churchId: number | null;
  churchName: string | null;
  content: string;
  aspect: Holy365Aspect;
  images: string[];
  verses: Holy365PostVerse[];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  /** UTC ISO 문자열 — DB 는 UTC 로 저장하고 시간대 없이 돌려주므로 Z 를 붙여 내려준다 */
  createdAt: string;
}

export interface Holy365CommentRow {
  id: number;
  postId: number;
  userId: number;
  name: string;
  iconImageUrl: string | null;
  content: string;
  createdAt: string;
}

const POST_COLUMNS = `p.id, p.user_id AS "userId", u.name, u.icon_image_url AS "iconImageUrl", u.church_id AS "churchId", ch.name AS "churchName",
  p.content, p.aspect, p.images, p.verses, p.like_count AS "likeCount", p.comment_count AS "commentCount", to_char(p.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt",
  EXISTS (SELECT 1 FROM holy365_post_likes l WHERE l.post_id = p.id AND l.user_id = $1) AS "likedByMe"`;

const POST_FROM = `FROM holy365_posts p JOIN holy365_users u ON u.id = p.user_id LEFT JOIN holy365_churches ch ON ch.id = u.church_id
  WHERE p.deleted_at IS NULL AND u.deleted_at IS NULL`;

/** $1 = 보는 사람 — 그 사람이 차단한 사람의 글은 뺀다 */
const NOT_BLOCKED = (column: string) => `${column} NOT IN (SELECT blocked_id FROM holy365_blocks WHERE blocker_id = $1)`;

/** TypeORM(postgres) 는 UPDATE·DELETE ... RETURNING 결과를 [rows, 영향받은 수] 로, INSERT 는 rows 로 준다 */
function returnedRows<T>(result: unknown): T[] {
  return Array.isArray(result) && Array.isArray(result[0]) ? (result[0] as T[]) : ((result as T[]) ?? []);
}

export type Holy365FeedScope = { kind: 'all' } | { kind: 'following'; userId: number } | { kind: 'user'; userId: number };

@Injectable()
export class Holy365FeedRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(input: { userId: number; content: string; aspect: Holy365Aspect; images: string[]; verses: Holy365PostVerse[] }): Promise<number> {
    const rows = await this.dataSource.query(
      `INSERT INTO holy365_posts (user_id, content, aspect, images, verses, lang) VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT locale FROM holy365_users WHERE id = $1), 'ko')) RETURNING id`,
      [input.userId, input.content, input.aspect, JSON.stringify(input.images), JSON.stringify(input.verses)],
    );
    return rows[0].id;
  }

  /** 최신 순, before(게시물 id) 보다 오래된 것부터 limit 개. 전체·팔로잉은 같은 언어(lang) 글만, 차단한 사람 글은 빼고 */
  list(scope: Holy365FeedScope, viewerId: number | null, before: number | null, limit: number, lang = 'ko'): Promise<Holy365PostRow[]> {
    const params: (number | string | null)[] = [viewerId ?? 0, before, limit];
    let filter = `AND ${NOT_BLOCKED('p.user_id')}`;
    if (scope.kind === 'following') {
      params.push(scope.userId, lang);
      filter += ` AND p.lang = $5 AND (p.user_id = $4 OR p.user_id IN (SELECT following_id FROM holy365_follows WHERE follower_id = $4))`;
    } else if (scope.kind === 'user') {
      params.push(scope.userId);
      filter += ` AND p.user_id = $4`;
    } else {
      params.push(lang);
      filter += ` AND p.lang = $4`;
    }

    return this.dataSource.query(`SELECT ${POST_COLUMNS} ${POST_FROM} ${filter} AND ($2::int IS NULL OR p.id < $2) ORDER BY p.id DESC LIMIT $3`, params);
  }

  async find(postId: number, viewerId: number | null): Promise<Holy365PostRow | null> {
    const rows = await this.dataSource.query(`SELECT ${POST_COLUMNS} ${POST_FROM} AND p.id = $2`, [viewerId ?? 0, postId]);
    return rows[0] ?? null;
  }

  async authorOf(postId: number): Promise<number | null> {
    const rows = await this.dataSource.query(`SELECT user_id AS "userId" FROM holy365_posts WHERE id = $1 AND deleted_at IS NULL`, [postId]);
    return rows[0]?.userId ?? null;
  }

  async softDelete(postId: number): Promise<string[]> {
    const rows = returnedRows<{ images: string[] }>(
      await this.dataSource.query(`UPDATE holy365_posts SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING images`, [postId]),
    );
    await this.dataSource.query(`UPDATE holy365_post_comments SET deleted_at = now() WHERE post_id = $1 AND deleted_at IS NULL`, [postId]);
    return rows[0]?.images ?? [];
  }

  /** 좋아요 — 처음 누를 때만 카운터를 올린다 */
  async like(postId: number, userId: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const inserted = returnedRows(
        await manager.query(`INSERT INTO holy365_post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING post_id`, [postId, userId]),
      );
      if (inserted.length) await manager.query(`UPDATE holy365_posts SET like_count = like_count + 1 WHERE id = $1`, [postId]);
    });
  }

  async unlike(postId: number, userId: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const deleted = returnedRows(
        await manager.query(`DELETE FROM holy365_post_likes WHERE post_id = $1 AND user_id = $2 RETURNING post_id`, [postId, userId]),
      );
      if (deleted.length) await manager.query(`UPDATE holy365_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1`, [postId]);
    });
  }

  comments(postId: number, viewerId: number | null = null): Promise<Holy365CommentRow[]> {
    return this.dataSource.query(
      `SELECT c.id, c.post_id AS "postId", c.user_id AS "userId", u.name, u.icon_image_url AS "iconImageUrl", c.content, to_char(c.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
         FROM holy365_post_comments c JOIN holy365_users u ON u.id = c.user_id
        WHERE c.post_id = $1 AND c.deleted_at IS NULL AND u.deleted_at IS NULL
          AND c.user_id NOT IN (SELECT blocked_id FROM holy365_blocks WHERE blocker_id = $2)
        ORDER BY c.id LIMIT 300`,
      [postId, viewerId ?? 0],
    );
  }

  async addComment(postId: number, userId: number, content: string): Promise<number> {
    return this.dataSource.transaction(async manager => {
      const rows = await manager.query(`INSERT INTO holy365_post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id`, [
        postId,
        userId,
        content,
      ]);
      await manager.query(`UPDATE holy365_posts SET comment_count = comment_count + 1 WHERE id = $1`, [postId]);
      return rows[0].id;
    });
  }

  async findComment(commentId: number): Promise<{ postId: number; userId: number } | null> {
    const rows = await this.dataSource.query(
      `SELECT post_id AS "postId", user_id AS "userId" FROM holy365_post_comments WHERE id = $1 AND deleted_at IS NULL`,
      [commentId],
    );
    return rows[0] ?? null;
  }

  async deleteComment(commentId: number, postId: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const rows = returnedRows(
        await manager.query(`UPDATE holy365_post_comments SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`, [commentId]),
      );
      if (rows.length) await manager.query(`UPDATE holy365_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1`, [postId]);
    });
  }

  async report(reporterId: number, targetType: 'post' | 'comment', targetId: number, reason: string): Promise<void> {
    await this.dataSource.query(`INSERT INTO holy365_reports (reporter_user_id, target_type, target_id, reason) VALUES ($1, $2, $3, $4)`, [
      reporterId,
      targetType,
      targetId,
      reason,
    ]);
  }
}
