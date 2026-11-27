import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

/**
 * 다른 사이트 글을 온교회 교회로 옮길 때 쓰는 저장소.
 * 원래 글 날짜를 created_at 으로 살려야 해서 기존 저장소 대신 직접 넣는다(알림도 보내지 않는다).
 * 옮긴 글은 onchurch_import_logs 에 남겨 다시 실행해도 겹치지 않게 한다.
 */
@Injectable()
export class OnchurchImportRepository implements OnModuleInit {
  private readonly logger = new Logger(OnchurchImportRepository.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.dataSource.query(`CREATE TABLE IF NOT EXISTS onchurch_import_logs (
        id         SERIAL PRIMARY KEY,
        church_id  INTEGER NOT NULL,
        source_key VARCHAR(300) NOT NULL,
        target     VARCHAR(20) NOT NULL,
        target_id  INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE (church_id, source_key)
      )`);
    } catch (error) {
      this.logger.error(`온교회 가져오기 기록 테이블 생성 실패: ${error}`);
    }
  }

  async findChurch(churchId: number): Promise<{ id: number; ownerId: number } | null> {
    const rows: { id: number; owner_id: number }[] = await this.dataSource.query(
      `SELECT id, owner_id FROM onchurch_churches WHERE id = $1 AND deleted_at IS NULL`,
      [churchId],
    );
    return rows[0] ? { id: rows[0].id, ownerId: rows[0].owner_id } : null;
  }

  async isImported(churchId: number, sourceKey: string): Promise<boolean> {
    const rows = await this.dataSource.query(`SELECT 1 FROM onchurch_import_logs WHERE church_id = $1 AND source_key = $2`, [churchId, sourceKey]);
    return rows.length > 0;
  }

  async markImported(churchId: number, sourceKey: string, target: string, targetId: number): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO onchurch_import_logs (church_id, source_key, target, target_id) VALUES ($1, $2, $3, $4) ON CONFLICT (church_id, source_key) DO NOTHING`,
      [churchId, sourceKey, target, targetId],
    );
  }

  // ── 카테고리: 이름이 같은 것이 있으면 쓰고, 없으면 맨 뒤에 만든다. '전체' 보기가 한 번도 없었으면 함께 만든다.

  async findOrCreateSermonSeries(churchId: number, name: string): Promise<number> {
    return this.findOrCreateCategory('onchurch_sermon_series', churchId, name, true);
  }

  async ensureNoticeCategory(churchId: number, name: string): Promise<void> {
    await this.findOrCreateCategory('onchurch_notice_categories', churchId, name, true);
  }

  async findOrCreateGalleryCategory(churchId: number, name: string): Promise<number> {
    return this.findOrCreateCategory('onchurch_gallery_categories', churchId, name, true);
  }

  async ensureCommunityCategory(churchId: number, name: string): Promise<void> {
    await this.findOrCreateCategory('onchurch_community_categories', churchId, name, false);
  }

  private async findOrCreateCategory(table: string, churchId: number, name: string, hasAll: boolean): Promise<number> {
    return this.dataSource.transaction(async (m: EntityManager) => {
      // 같은 교회 카테고리 생성이 동시에 겹치지 않게 잠근다
      await m.query(`SELECT pg_advisory_xact_lock(hashtext($1), $2)`, [table, churchId]);
      const found: { id: number }[] = await m.query(`SELECT id FROM ${table} WHERE church_id = $1 AND name = $2 AND deleted_at IS NULL ORDER BY id LIMIT 1`, [
        churchId,
        name,
      ]);
      if (found[0]) return found[0].id;
      if (hasAll) {
        const all = await m.query(`SELECT 1 FROM ${table} WHERE church_id = $1 AND is_all = true`, [churchId]);
        if (all.length === 0) {
          await m.query(`INSERT INTO ${table} (church_id, name, sort_order, is_active, is_all) VALUES ($1, '전체', 0, true, true)`, [churchId]);
        }
      }
      const max: { max: number | null }[] = await m.query(`SELECT MAX(sort_order) AS max FROM ${table} WHERE church_id = $1 AND deleted_at IS NULL`, [
        churchId,
      ]);
      const inserted: { id: number }[] = await m.query(
        `INSERT INTO ${table} (church_id, name, sort_order, is_active${hasAll ? ', is_all' : ''}) VALUES ($1, $2, $3, true${hasAll ? ', false' : ''}) RETURNING id`,
        [churchId, name, (max[0]?.max ?? 0) + 1],
      );
      return inserted[0].id;
    });
  }

  // ── 글

  async insertSermon(row: {
    churchId: number;
    seriesId: number;
    title: string;
    pastor: string | null;
    date: string;
    videoUrl: string | null;
    summary: string | null;
    createdAt: string;
  }): Promise<number> {
    const r: { id: number }[] = await this.dataSource.query(
      `INSERT INTO onchurch_sermons (church_id, series_id, title, pastor, date, video_url, summary, is_featured, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, 0, true, $8, $8) RETURNING id`,
      [row.churchId, row.seriesId, row.title.slice(0, 200), row.pastor, row.date, row.videoUrl, row.summary, row.createdAt],
    );
    return r[0].id;
  }

  async insertNotice(row: {
    churchId: number;
    category: string;
    title: string;
    content: string | null;
    imageUrls: string[];
    publishedAt: string;
  }): Promise<number> {
    return this.dataSource.transaction(async m => {
      await m.query(`SELECT pg_advisory_xact_lock(hashtext('onchurch_notices'), $1)`, [row.churchId]);
      const seq: { max: number | null }[] = await m.query(`SELECT MAX(seq_no) AS max FROM onchurch_notices WHERE church_id = $1`, [row.churchId]);
      const r: { id: number }[] = await m.query(
        `INSERT INTO onchurch_notices (church_id, seq_no, category, title, content, image_urls, attachments, is_pinned, is_active, published_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, '[]'::jsonb, false, true, $7, $7, $7) RETURNING id`,
        [row.churchId, (seq[0]?.max ?? 0) + 1, row.category.slice(0, 50), row.title.slice(0, 300), row.content, JSON.stringify(row.imageUrls), row.publishedAt],
      );
      return r[0].id;
    });
  }

  async insertGalleryItems(
    rows: { churchId: number; categoryId: number; batchId: string; title: string; date: string; photoUrl: string; sortOrder: number; createdAt: string }[],
  ): Promise<number[]> {
    return this.dataSource.transaction(async m => {
      const ids: number[] = [];
      for (const row of rows) {
        const r: { id: number }[] = await m.query(
          `INSERT INTO onchurch_galleries (church_id, category_id, batch_id, title, date, photo_url, visibility, sort_order, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'public', $7, true, $8, $8) RETURNING id`,
          [row.churchId, row.categoryId, row.batchId, row.title.slice(0, 200), row.date, row.photoUrl, row.sortOrder, row.createdAt],
        );
        ids.push(r[0].id);
      }
      return ids;
    });
  }

  async insertCommunityPost(row: {
    churchId: number;
    authorId: number;
    authorName: string;
    category: string;
    title: string;
    content: string | null;
    photoUrls: string[];
    videoUrl: string | null;
    createdAt: string;
  }): Promise<number> {
    const r: { id: number }[] = await this.dataSource.query(
      `INSERT INTO onchurch_community_posts (church_id, author_id, author_name, category, title, content, photo_urls, video_url, is_hidden, report_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, false, 0, $9, $9) RETURNING id`,
      [
        row.churchId,
        row.authorId,
        row.authorName.slice(0, 80),
        row.category.slice(0, 50),
        row.title.slice(0, 300),
        row.content,
        JSON.stringify(row.photoUrls),
        row.videoUrl,
        row.createdAt,
      ],
    );
    return r[0].id;
  }

  // ── 설교 정리(마스터 도구)

  async listSermonVideos(
    churchId: number,
    offset: number,
    limit: number,
  ): Promise<{ items: { id: number; title: string; date: string | null; videoUrl: string | null }[]; total: number }> {
    const rows: { id: number; title: string; date: string | null; video_url: string | null }[] = await this.dataSource.query(
      `SELECT id, title, date, video_url FROM onchurch_sermons WHERE church_id = $1 AND deleted_at IS NULL ORDER BY id LIMIT $2 OFFSET $3`,
      [churchId, limit, offset],
    );
    const count: { n: string }[] = await this.dataSource.query(`SELECT COUNT(*) AS n FROM onchurch_sermons WHERE church_id = $1 AND deleted_at IS NULL`, [
      churchId,
    ]);
    return { items: rows.map(r => ({ id: r.id, title: r.title, date: r.date, videoUrl: r.video_url })), total: Number(count[0]?.n ?? 0) };
  }

  /** 그 교회 설교만 지운다(되살릴 수 있게 deleted_at 표시). 지운 수. */
  async softDeleteSermons(churchId: number, ids: number[]): Promise<number> {
    const rows = await this.dataSource.query(
      `UPDATE onchurch_sermons SET deleted_at = now() WHERE church_id = $1 AND id = ANY($2::int[]) AND deleted_at IS NULL RETURNING id`,
      [churchId, ids],
    );
    return Array.isArray(rows?.[0]) ? rows[0].length : Array.isArray(rows) ? rows.length : 0;
  }
}
