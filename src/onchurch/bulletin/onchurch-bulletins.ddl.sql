-- onchurch_bulletins 테이블 생성 DDL
-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.
-- (다른 onchurch 테이블과 동일하게 수동 적용)

CREATE TABLE IF NOT EXISTS onchurch_bulletins (
  id                 SERIAL PRIMARY KEY,
  church_id          INTEGER NOT NULL UNIQUE,
  template_id        VARCHAR(32) NOT NULL DEFAULT 'classic',
  service_date       VARCHAR(120),
  location_image_url VARCHAR(1000),
  issue_no           VARCHAR(60),
  cover_verse        TEXT,
  cover_verse_ref    VARCHAR(120),
  worship_order      JSONB NOT NULL DEFAULT '[]'::jsonb,
  worship_services   JSONB NOT NULL DEFAULT '[]'::jsonb,
  staff              JSONB NOT NULL DEFAULT '[]'::jsonb,
  news               JSONB NOT NULL DEFAULT '[]'::jsonb,
  volunteers         JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMP
);

-- 이미 테이블이 있는 운영 DB는 아래 컬럼만 추가 (표지 항목: 주보 호수 / 금주의 말씀)
ALTER TABLE onchurch_bulletins ADD COLUMN IF NOT EXISTS issue_no        VARCHAR(60);
ALTER TABLE onchurch_bulletins ADD COLUMN IF NOT EXISTS cover_verse     TEXT;
ALTER TABLE onchurch_bulletins ADD COLUMN IF NOT EXISTS cover_verse_ref VARCHAR(120);
