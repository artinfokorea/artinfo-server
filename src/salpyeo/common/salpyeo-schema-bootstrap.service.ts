import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SALPYEO_FACILITY_SEED, SalpyeoFacilitySeed } from '@/salpyeo/facility/domain/constant/salpyeo-facility-seed.constant';
import { isSalpyeoMemoryRepository } from '@/salpyeo/common/salpyeo-repository-mode';

/** 시드 INSERT 컬럼 (slug 제외) — VALUES 순서를 한 곳에서 관리 */
const SEED_COLUMNS = [
  'vertical',
  'name',
  'meta',
  'sido',
  'sigungu',
  'operator_type',
  'address',
  'phone',
  'website',
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
    s.website,
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
 * 기동 시 살펴 테이블을 멱등하게 만들고, 비어 있는 시설만 시드로 채운다.
 * - CREATE TABLE IF NOT EXISTS + ALTER TABLE ADD COLUMN IF NOT EXISTS (synchronize:false 환경에서 DDL 순서 사고 방지)
 * - 시드는 slug 기준 INSERT ... ON CONFLICT DO NOTHING — **이미 있는 행은 절대 덮어쓰지 않는다**
 *
 * 시설 정보의 원천은 이제 DB 이고, 갱신은 관리자 페이지(PUT /salpyeo/admin/facilities/:slug)로만 한다.
 * 그래서 예전의 "매 기동마다 시드로 덮어쓰기 + 시드에 없는 slug DELETE" 규칙을 없앴다 — 관리자가 고친 값이
 * 배포 때마다 공공데이터로 되돌아가면 안 되기 때문. 시드 상수는 빈 DB(새 환경)를 채우는 용도로만 남는다.
 *
 * 원본 DDL: facility/salpyeo-facilities.ddl.sql · user/salpyeo-users.ddl.sql · auth/salpyeo-auths.ddl.sql
 */
@Injectable()
export class SalpyeoSchemaBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(SalpyeoSchemaBootstrapService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    if (isSalpyeoMemoryRepository()) return;

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
      website           VARCHAR(300) NOT NULL DEFAULT '',
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
      `website VARCHAR(300) NOT NULL DEFAULT ''`,
    ]) {
      await this.dataSource.query(`ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS ${ddl}`);
    }

    await this.ensureAccountSchema();
  }

  /** 구글 로그인 계정·세션 (user/salpyeo-users.ddl.sql · auth/salpyeo-auths.ddl.sql 과 같은 문장) */
  private async ensureAccountSchema(): Promise<void> {
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS salpyeo_users (
      id             SERIAL PRIMARY KEY,
      name           VARCHAR(40) NOT NULL,
      sns_type       VARCHAR(16) NOT NULL,
      sns_id         VARCHAR NOT NULL,
      email          VARCHAR,
      icon_image_url VARCHAR,
      role           VARCHAR(16) NOT NULL DEFAULT 'USER',
      created_at     TIMESTAMP NOT NULL DEFAULT now(),
      updated_at     TIMESTAMP NOT NULL DEFAULT now(),
      deleted_at     TIMESTAMP
    )`);
    await this.dataSource.query(`CREATE UNIQUE INDEX IF NOT EXISTS uidx_salpyeo_users_sns ON salpyeo_users (sns_type, sns_id) WHERE deleted_at IS NULL`);
    // 로그인 기능이 먼저 배포된 환경에는 role 이 없다 — 관리자 승격은 이 컬럼을 DB 에서 직접 바꾼다
    await this.dataSource.query(`ALTER TABLE salpyeo_users ADD COLUMN IF NOT EXISTS role VARCHAR(16) NOT NULL DEFAULT 'USER'`);

    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS salpyeo_auths (
      id                       SERIAL PRIMARY KEY,
      type                     VARCHAR(16) NOT NULL,
      user_id                  INTEGER NOT NULL,
      access_token             VARCHAR NOT NULL,
      access_token_expires_in  TIMESTAMP NOT NULL,
      refresh_token            VARCHAR NOT NULL,
      refresh_token_expires_in TIMESTAMP NOT NULL,
      created_at               TIMESTAMP NOT NULL DEFAULT now(),
      updated_at               TIMESTAMP NOT NULL DEFAULT now()
    )`);
    await this.dataSource.query(`CREATE INDEX IF NOT EXISTS idx_salpyeo_auths_user ON salpyeo_auths (user_id)`);
    await this.dataSource.query(`CREATE INDEX IF NOT EXISTS idx_salpyeo_auths_tokens ON salpyeo_auths (access_token, refresh_token)`);
  }

  /** 빈 DB 를 채우는 용도 — 이미 있는 slug 는 건드리지 않는다 (관리자 수정 보존) */
  private async syncSeed(seed: readonly SalpyeoFacilitySeed[]): Promise<void> {
    const width = SEED_COLUMNS.length + 1; // + slug
    let inserted = 0;

    for (let start = 0; start < seed.length; start += UPSERT_BATCH) {
      const batch = seed.slice(start, start + UPSERT_BATCH);
      const rows = batch.map((_, row) => {
        const placeholders = ['slug', ...SEED_COLUMNS].map((c, col) => `$${row * width + col + 1}${JSONB_COLUMNS.has(c) ? '::jsonb' : ''}`);
        return `(${placeholders.join(', ')})`;
      });
      const result = await this.dataSource.query(
        `INSERT INTO salpyeo_facilities (slug, ${SEED_COLUMNS.join(', ')})
         VALUES ${rows.join(', ')}
         ON CONFLICT (slug) DO NOTHING`,
        batch.flatMap(seedValues),
      );
      // node-postgres 는 [rows, rowCount] 형태로 돌려준다
      inserted += Array.isArray(result) && typeof result[1] === 'number' ? result[1] : 0;
    }

    this.logger.log(`salpyeo seed: ${seed.length}건 중 ${inserted}건 신규 삽입 (기존 행은 유지 — 갱신은 관리자 페이지에서)`);
  }
}
