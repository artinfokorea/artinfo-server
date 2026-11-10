import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CompetitionListFilter, CompetitionPhase, CompetitionRow, CompetitionSource, CompetitionStatus, CompetitionWrite } from './competition.types';

/** 한국 날짜 기준 접수 상태·D-day 를 함께 뽑는 SELECT (FROM competitions c, d 를 전제) */
const PHASE_SQL = `CASE
  WHEN c.open_at > d.today THEN 'UPCOMING'
  WHEN c.close_at >= d.today THEN CASE WHEN c.close_at - d.today <= 7 THEN 'SOON' ELSE 'OPEN' END
  WHEN COALESCE(c.held_at, c.close_at) >= d.today THEN 'JUDGING'
  ELSE 'CLOSED' END`;
const SELECT_ROW = `c.*, ${PHASE_SQL} AS phase, (c.close_at - d.today)::int AS d_day, (c.open_at - d.today)::int AS open_in`;
const TODAY_CTE = `d AS (SELECT (now() AT TIME ZONE 'Asia/Seoul')::date AS today)`;
/** 목록 정렬: 마감임박 → 접수중 → 접수예정 → 심사중 → 종료, 같은 묶음 안에서는 가까운 날짜순 */
const ORDER_SQL = `ORDER BY CASE phase WHEN 'SOON' THEN 0 WHEN 'OPEN' THEN 1 WHEN 'UPCOMING' THEN 2 WHEN 'JUDGING' THEN 3 ELSE 4 END,
  CASE WHEN phase = 'UPCOMING' THEN open_at ELSE close_at END ASC, id DESC`;

/**
 * 콩쿠르 공고 저장소. synchronize:false 라 기동 시 멱등 DDL 로 테이블을 보장한다 (push·moderation 과 같은 방식).
 * 접수 상태(phase)는 저장하지 않고 조회할 때 DB 의 한국 날짜로 계산한다.
 */
@Injectable()
export class CompetitionRepository implements OnModuleInit {
  private readonly logger = new Logger(CompetitionRepository.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(`콩쿠르 테이블 생성 실패: ${error}`);
    }
  }

  async ensureSchema(): Promise<void> {
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS competitions (
      id            SERIAL PRIMARY KEY,
      title         VARCHAR NOT NULL,
      host          VARCHAR NOT NULL,
      organizer     VARCHAR,
      area          VARCHAR NOT NULL,
      venue         VARCHAR,
      divisions     TEXT[] NOT NULL DEFAULT '{}',
      ages          TEXT[] NOT NULL DEFAULT '{}',
      open_at       DATE NOT NULL,
      close_at      DATE NOT NULL,
      held_at       DATE,
      result_at     DATE,
      fee           VARCHAR,
      apply_method  VARCHAR(16) NOT NULL DEFAULT 'LINK',
      apply_link    VARCHAR,
      tel           VARCHAR,
      email         VARCHAR,
      prize         TEXT,
      description   TEXT,
      poster_url    VARCHAR,
      document_url  VARCHAR,
      source        VARCHAR(16) NOT NULL DEFAULT 'OWNER',
      source_url    VARCHAR,
      status        VARCHAR(16) NOT NULL DEFAULT 'REVIEW',
      user_id       INTEGER,
      verified      BOOLEAN NOT NULL DEFAULT FALSE,
      view_count    INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMP NOT NULL DEFAULT now(),
      updated_at    TIMESTAMP NOT NULL DEFAULT now(),
      deleted_at    TIMESTAMP
    )`);
    await this.dataSource.query(`CREATE UNIQUE INDEX IF NOT EXISTS uidx_competitions_source_url ON competitions (source_url) WHERE source_url IS NOT NULL`);
    await this.dataSource.query(`CREATE INDEX IF NOT EXISTS idx_competitions_close_at ON competitions (close_at)`);
    await this.dataSource.query(`CREATE INDEX IF NOT EXISTS idx_competitions_user ON competitions (user_id)`);
  }

  /** 게시된 공고 목록. phases 가 비어 있으면 종료된 대회는 뺀다 */
  async findPage(filter: CompetitionListFilter): Promise<{ items: CompetitionRow[]; totalCount: number }> {
    const where: string[] = [];
    const params: unknown[] = [];
    const add = (sql: string, value: unknown) => {
      params.push(value);
      where.push(sql.replace('?', `$${params.length}`));
    };
    if (filter.phases.length) {
      const phases = new Set<CompetitionPhase>(filter.phases);
      if (phases.has('OPEN')) phases.add('SOON'); // 마감임박은 접수중의 일부
      add('phase = ANY(?::text[])', [...phases]);
    } else {
      where.push(`phase <> 'CLOSED'`);
    }
    if (filter.divisions.length) add('divisions && ?::text[]', filter.divisions);
    if (filter.areas.length) add('area = ANY(?::text[])', filter.areas);
    if (filter.keyword?.trim())
      add(
        `(title ILIKE ? OR host ILIKE ? OR area ILIKE ?)`.replace(/\?/g, () => `$${params.length + 1}`),
        `%${filter.keyword.trim()}%`,
      );
    params.push(filter.size, Math.max(0, filter.page - 1) * filter.size);

    const rows: CompetitionRow[] = await this.dataSource.query(
      `WITH ${TODAY_CTE}, c AS (
         SELECT ${SELECT_ROW} FROM competitions c, d WHERE c.deleted_at IS NULL AND c.status = 'PUBLISHED'
       )
       SELECT *, COUNT(*) OVER()::int AS total_count FROM c
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ${ORDER_SQL}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return { items: rows, totalCount: Number(rows[0]?.total_count ?? 0) };
  }

  /** 삭제되지 않은 공고 하나 (REVIEW·HIDDEN 포함 — 노출 여부는 서비스가 판단) */
  async findById(id: number): Promise<CompetitionRow | null> {
    const rows: CompetitionRow[] = await this.dataSource.query(
      `WITH ${TODAY_CTE} SELECT ${SELECT_ROW} FROM competitions c, d WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(
    input: CompetitionWrite,
    meta: { userId: number | null; status: CompetitionStatus; source: CompetitionSource; sourceUrl?: string | null },
  ): Promise<number> {
    const rows: { id: number }[] = await this.dataSource.query(
      `INSERT INTO competitions (title, host, organizer, area, venue, divisions, ages, open_at, close_at, held_at, result_at, fee, apply_method, apply_link, tel, email,
         prize, description, poster_url, document_url, source, source_url, status, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING id`,
      [
        input.title,
        input.host,
        input.organizer,
        input.area,
        input.venue,
        input.divisions,
        input.ages,
        input.openAt,
        input.closeAt,
        input.heldAt,
        input.resultAt,
        input.fee,
        input.applyMethod,
        input.applyLink,
        input.tel,
        input.email,
        input.prize,
        input.description,
        input.posterUrl,
        input.documentUrl,
        meta.source,
        meta.sourceUrl ?? null,
        meta.status,
        meta.userId,
      ],
    );
    return rows[0].id;
  }

  /**
   * 수집 공고 upsert — 원문 URL 이 같으면 일정·장소·포스터·연락처만 갱신하고(제목·부문은 처음 값 유지) 없으면 게시 상태로 새로 만든다.
   * 삭제된(deleted_at) 공고는 되살리지 않는다 (관리자가 지운 건 다시 올라오지 않게)
   */
  async upsertCrawled(input: CompetitionWrite, sourceUrl: string): Promise<{ id: number; created: boolean }> {
    const rows: { id: number; created: boolean }[] = await this.dataSource.query(
      `INSERT INTO competitions (title, host, organizer, area, venue, divisions, ages, open_at, close_at, held_at, result_at, fee, apply_method, apply_link, tel, email,
         prize, description, poster_url, document_url, source, source_url, status, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'CRAWL', $21, 'PUBLISHED', NULL)
       ON CONFLICT (source_url) WHERE source_url IS NOT NULL DO UPDATE SET
         open_at = EXCLUDED.open_at, close_at = EXCLUDED.close_at, held_at = COALESCE(EXCLUDED.held_at, competitions.held_at),
         venue = COALESCE(EXCLUDED.venue, competitions.venue), tel = COALESCE(EXCLUDED.tel, competitions.tel), email = COALESCE(EXCLUDED.email, competitions.email),
         poster_url = COALESCE(EXCLUDED.poster_url, competitions.poster_url), description = COALESCE(EXCLUDED.description, competitions.description), updated_at = now()
       WHERE competitions.deleted_at IS NULL
       RETURNING id, (xmax = 0) AS created`,
      [
        input.title,
        input.host,
        input.organizer,
        input.area,
        input.venue,
        input.divisions,
        input.ages,
        input.openAt,
        input.closeAt,
        input.heldAt,
        input.resultAt,
        input.fee,
        input.applyMethod,
        input.applyLink,
        input.tel,
        input.email,
        input.prize,
        input.description,
        input.posterUrl,
        input.documentUrl,
        sourceUrl,
      ],
    );
    if (!rows[0]) {
      const existing: { id: number }[] = await this.dataSource.query(`SELECT id FROM competitions WHERE source_url = $1`, [sourceUrl]);
      return { id: existing[0]?.id ?? 0, created: false };
    }
    return { id: rows[0].id, created: Boolean(rows[0].created) };
  }

  async update(id: number, input: CompetitionWrite): Promise<void> {
    await this.dataSource.query(
      `UPDATE competitions SET title = $2, host = $3, organizer = $4, area = $5, venue = $6, divisions = $7, ages = $8, open_at = $9, close_at = $10,
         held_at = $11, result_at = $12, fee = $13, apply_method = $14, apply_link = $15, tel = $16, email = $17, prize = $18, description = $19,
         poster_url = $20, document_url = $21, updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL`,
      [
        id,
        input.title,
        input.host,
        input.organizer,
        input.area,
        input.venue,
        input.divisions,
        input.ages,
        input.openAt,
        input.closeAt,
        input.heldAt,
        input.resultAt,
        input.fee,
        input.applyMethod,
        input.applyLink,
        input.tel,
        input.email,
        input.prize,
        input.description,
        input.posterUrl,
        input.documentUrl,
      ],
    );
  }

  async updateStatus(id: number, status: CompetitionStatus): Promise<void> {
    await this.dataSource.query(`UPDATE competitions SET status = $2, updated_at = now() WHERE id = $1 AND deleted_at IS NULL`, [id, status]);
  }

  async softDelete(id: number): Promise<void> {
    await this.dataSource.query(`UPDATE competitions SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, [id]);
  }

  async increaseViewCount(id: number): Promise<void> {
    await this.dataSource.query(`UPDATE competitions SET view_count = view_count + 1 WHERE id = $1`, [id]);
  }

  /** 관리자 여부 — users.type = 'ADMIN' */
  async isAdmin(userId: number): Promise<boolean> {
    const rows: { type: string }[] = await this.dataSource.query(`SELECT type FROM users WHERE id = $1 AND deleted_at IS NULL`, [userId]);
    return rows[0]?.type === 'ADMIN';
  }
}
