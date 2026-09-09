import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SALPYEO_FACILITY_SEED, SalpyeoFacilitySeed } from '@/salpyeo/facility/domain/constant/salpyeo-facility-seed.constant';

/** 시드 upsert 컬럼 (slug 제외) — VALUES 순서와 UPDATE SET 을 한 곳에서 관리 */
const SEED_COLUMNS = [
  'vertical',
  'name',
  'meta',
  'sido',
  'sigungu',
  'operator_type',
  'address',
  'phone',
  'distance_label',
  'distance_minutes',
  'inspection_badge',
  'feature_badge',
  'price',
  'rating',
  'review_count',
  'vs_avg_percent',
  'images',
  'price_rows',
  'inspections',
  'review',
  'sort_order',
] as const;
const JSONB_COLUMNS = new Set(['images', 'price_rows', 'inspections', 'review']);
const UPSERT_BATCH = 100;

function seedValues(s: SalpyeoFacilitySeed): unknown[] {
  return [
    s.slug,
    s.vertical,
    s.name,
    s.meta,
    s.sido,
    s.sigungu,
    s.operatorType,
    s.address,
    s.phone,
    s.distanceLabel,
    s.distanceMinutes,
    s.inspectionBadge,
    s.featureBadge,
    s.price,
    s.rating,
    s.reviewCount,
    s.vsAvgPercent,
    JSON.stringify(s.images),
    JSON.stringify(s.priceRows),
    JSON.stringify(s.inspections),
    s.review ? JSON.stringify(s.review) : null,
    s.sortOrder,
  ];
}

/**
 * 기동 시 살펴 테이블을 멱등하게 만들고 시드(공공데이터)를 동기화한다.
 * - CREATE TABLE IF NOT EXISTS + ALTER TABLE ADD COLUMN IF NOT EXISTS (synchronize:false 환경에서 DDL 순서 사고 방지)
 * - 시드는 slug 기준 INSERT ... ON CONFLICT DO UPDATE (데이터 갱신이 배포로 반영되도록)
 * - 시드에 없는 slug 는 DELETE — 시드가 유일한 데이터 원천인 동안만 유효한 규칙 (과거 목데이터 p1·n1… 도 이걸로 정리)
 * 원본 DDL: facility/salpyeo-facilities.ddl.sql
 */
@Injectable()
export class SalpyeoSchemaBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(SalpyeoSchemaBootstrapService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env['SALPYEO_REPOSITORY'] === 'memory') return;

    try {
      await this.ensureSchema();
      await this.syncSeed(SALPYEO_FACILITY_SEED);
    } catch (error) {
      // 권한 부족 등으로 실패해도 서버 기동은 막지 않는다 — 수동 DDL 적용으로 복구 가능
      this.logger.error(`salpyeo schema bootstrap failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async ensureSchema(): Promise<void> {
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS salpyeo_facilities (
      id                SERIAL PRIMARY KEY,
      slug              VARCHAR(40)  NOT NULL UNIQUE,
      vertical          VARCHAR(16)  NOT NULL,
      name              VARCHAR(100) NOT NULL,
      meta              VARCHAR(200) NOT NULL,
      sido              VARCHAR(20)  NOT NULL DEFAULT '',
      sigungu           VARCHAR(40)  NOT NULL DEFAULT '',
      operator_type     VARCHAR(20)  NOT NULL DEFAULT '',
      address           VARCHAR(200) NOT NULL DEFAULT '',
      phone             VARCHAR(30)  NOT NULL DEFAULT '',
      distance_label    VARCHAR(40)  NOT NULL,
      distance_minutes  INTEGER      NOT NULL,
      inspection_badge  VARCHAR(60)  NOT NULL,
      feature_badge     VARCHAR(60)  NOT NULL,
      price             INTEGER      NOT NULL,
      rating            NUMERIC(2,1) NOT NULL,
      review_count      INTEGER      NOT NULL DEFAULT 0,
      vs_avg_percent    INTEGER      NOT NULL DEFAULT 0,
      images            JSONB        NOT NULL DEFAULT '[]',
      price_rows        JSONB        NOT NULL DEFAULT '[]',
      inspections       JSONB        NOT NULL DEFAULT '[]',
      review            JSONB,
      is_active         BOOLEAN      NOT NULL DEFAULT true,
      sort_order        INTEGER      NOT NULL DEFAULT 0,
      created_at        TIMESTAMP    NOT NULL DEFAULT now(),
      updated_at        TIMESTAMP    NOT NULL DEFAULT now(),
      deleted_at        TIMESTAMP
    )`);
    await this.dataSource.query(`CREATE INDEX IF NOT EXISTS idx_salpyeo_facilities_vertical_active ON salpyeo_facilities (vertical, is_active)`);
    // 첫 배포(목데이터 시절) 테이블에는 없던 컬럼
    for (const ddl of [
      `sido VARCHAR(20) NOT NULL DEFAULT ''`,
      `sigungu VARCHAR(40) NOT NULL DEFAULT ''`,
      `operator_type VARCHAR(20) NOT NULL DEFAULT ''`,
      `address VARCHAR(200) NOT NULL DEFAULT ''`,
      `phone VARCHAR(30) NOT NULL DEFAULT ''`,
    ]) {
      await this.dataSource.query(`ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS ${ddl}`);
    }
  }

  private async syncSeed(seed: readonly SalpyeoFacilitySeed[]): Promise<void> {
    const width = SEED_COLUMNS.length + 1; // + slug
    const updateSet = SEED_COLUMNS.map(c => `${c} = EXCLUDED.${c}`).join(', ');

    for (let start = 0; start < seed.length; start += UPSERT_BATCH) {
      const batch = seed.slice(start, start + UPSERT_BATCH);
      const rows = batch.map((_, row) => {
        const placeholders = ['slug', ...SEED_COLUMNS].map((c, col) => `$${row * width + col + 1}${JSONB_COLUMNS.has(c) ? '::jsonb' : ''}`);
        return `(${placeholders.join(', ')})`;
      });
      await this.dataSource.query(
        `INSERT INTO salpyeo_facilities (slug, ${SEED_COLUMNS.join(', ')})
         VALUES ${rows.join(', ')}
         ON CONFLICT (slug) DO UPDATE SET ${updateSet}, updated_at = now()`,
        batch.flatMap(seedValues),
      );
    }

    // TypeORM 의 DELETE ... RETURNING 결과 형태가 버전마다 달라 SELECT → DELETE 두 단계로 나눈다
    const stale: { slug: string }[] = await this.dataSource.query(`SELECT slug FROM salpyeo_facilities WHERE NOT (slug = ANY($1::text[]))`, [
      seed.map(s => s.slug),
    ]);
    if (stale.length > 0) {
      await this.dataSource.query(`DELETE FROM salpyeo_facilities WHERE slug = ANY($1::text[])`, [stale.map(r => r.slug)]);
    }
    this.logger.log(`salpyeo seed synced: ${seed.length} upserted, ${stale.length} pruned${stale.length ? ` (${stale.map(r => r.slug).join(', ')})` : ''}`);
  }
}
