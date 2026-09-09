-- 살펴 사용자 (계정 — 구글 로그인 기준). 기동 시 SalpyeoSchemaBootstrapService 가 멱등 생성한다.
CREATE TABLE IF NOT EXISTS salpyeo_users (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_salpyeo_users_sns ON salpyeo_users (sns_type, sns_id) WHERE deleted_at IS NULL;
-- 로그인 기능이 먼저 배포된 환경용
ALTER TABLE salpyeo_users ADD COLUMN IF NOT EXISTS role VARCHAR(16) NOT NULL DEFAULT 'USER';

-- 관리자 승격은 손으로 한다:
--   UPDATE salpyeo_users SET role = 'ADMIN' WHERE email = '<관리자 구글 계정>';
