-- 살펴 시설 (5개 버티컬 공통) — 기동 시 SalpyeoSchemaBootstrapService 가 멱등 생성 + 공공데이터 시드 upsert
CREATE TABLE IF NOT EXISTS salpyeo_facilities (
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
);
CREATE INDEX IF NOT EXISTS idx_salpyeo_facilities_vertical_active ON salpyeo_facilities (vertical, is_active);
-- 기존 테이블에 뒤늦게 추가된 컬럼 (bootstrap 이 같은 문장을 실행)
ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS sido          VARCHAR(20)  NOT NULL DEFAULT '';
ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS sigungu       VARCHAR(40)  NOT NULL DEFAULT '';
ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS operator_type VARCHAR(20)  NOT NULL DEFAULT '';
ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS address       VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS phone         VARCHAR(30)  NOT NULL DEFAULT '';
-- 시드(domain/constant/salpyeo-facility-seed.constant.ts)는 bootstrap 이 slug 기준 INSERT ... ON CONFLICT DO UPDATE 로 넣고,
-- 시드에 없는 slug 는 DELETE 한다 (시드가 유일한 데이터 원천인 동안 — 관리자 편집이 생기면 이 규칙을 바꿀 것)
