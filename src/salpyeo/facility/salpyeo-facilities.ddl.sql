-- 살펴 시설 (5개 버티컬 공통) — 기동 시 SalpyeoSchemaBootstrapService 가 멱등 생성 + 샘플 시드
CREATE TABLE IF NOT EXISTS salpyeo_facilities (
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
);
CREATE INDEX IF NOT EXISTS idx_salpyeo_facilities_vertical_active ON salpyeo_facilities (vertical, is_active);
-- 시드는 domain/constant/salpyeo-facility-seed.constant.ts 를 bootstrap 이 INSERT ... ON CONFLICT (slug) DO NOTHING 으로 적용
