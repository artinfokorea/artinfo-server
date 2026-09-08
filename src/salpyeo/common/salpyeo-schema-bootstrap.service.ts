import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SALPYEO_FACILITY_SEED } from '@/salpyeo/facility/domain/constant/salpyeo-facility-seed.constant';

/**
 * 기동 시 살펴 테이블을 멱등하게 만들고 샘플 시설을 시드한다 (CREATE IF NOT EXISTS / ON CONFLICT DO NOTHING).
 * synchronize:false 환경에서 배포와 DDL 적용 순서가 어긋나 500 이 나는 사고를 막기 위한 안전장치.
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
      await this.dataSource.query(`CREATE TABLE IF NOT EXISTS salpyeo_facilities (
        id                SERIAL PRIMARY KEY,
        slug              VARCHAR(40)  NOT NULL UNIQUE,
        vertical          VARCHAR(16)  NOT NULL,
        name              VARCHAR(100) NOT NULL,
        meta              VARCHAR(200) NOT NULL,
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

      for (const s of SALPYEO_FACILITY_SEED) {
        await this.dataSource.query(
          `INSERT INTO salpyeo_facilities
             (slug, vertical, name, meta, distance_label, distance_minutes, inspection_badge, feature_badge,
              price, rating, review_count, vs_avg_percent, images, price_rows, inspections, review, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17)
           ON CONFLICT (slug) DO NOTHING`,
          [
            s.slug,
            s.vertical,
            s.name,
            s.meta,
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
          ],
        );
      }
    } catch (error) {
      // 권한 부족 등으로 실패해도 서버 기동은 막지 않는다 — 수동 DDL 적용으로 복구 가능
      this.logger.error(`salpyeo schema bootstrap failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
