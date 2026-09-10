-- 살펴 문의 (비로그인 접수). 기동 시 SalpyeoSchemaBootstrapService 가 멱등 생성한다.
CREATE TABLE IF NOT EXISTS salpyeo_inquiries (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(100) NOT NULL,
  content     TEXT NOT NULL,
  email       VARCHAR(200) NOT NULL,
  images      JSONB NOT NULL DEFAULT '[]',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_salpyeo_inquiries_created ON salpyeo_inquiries (created_at DESC);
