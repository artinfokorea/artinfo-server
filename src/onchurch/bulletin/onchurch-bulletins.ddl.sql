-- onchurch_bulletins 테이블 생성 DDL
-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.
-- (다른 onchurch 테이블과 동일하게 수동 적용)

CREATE TABLE IF NOT EXISTS onchurch_bulletins (
  id                 SERIAL PRIMARY KEY,
  church_id          INTEGER NOT NULL UNIQUE,
  template_id        VARCHAR(32) NOT NULL DEFAULT 'classic',
  service_date       VARCHAR(120),
  location_image_url VARCHAR(1000),
  worship_order      JSONB NOT NULL DEFAULT '[]'::jsonb,
  worship_services   JSONB NOT NULL DEFAULT '[]'::jsonb,
  staff              JSONB NOT NULL DEFAULT '[]'::jsonb,
  news               JSONB NOT NULL DEFAULT '[]'::jsonb,
  volunteers         JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMP
);
