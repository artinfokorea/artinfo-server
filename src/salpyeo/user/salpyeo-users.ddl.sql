-- 살펴 사용자 (계정 — 구글 로그인 기준). 기동 시 SalpyeoSchemaBootstrapService 가 멱등 생성한다.
CREATE TABLE IF NOT EXISTS salpyeo_users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(40) NOT NULL,
  sns_type       VARCHAR(16) NOT NULL,
  sns_id         VARCHAR NOT NULL,
  email          VARCHAR,
  icon_image_url VARCHAR,
  created_at     TIMESTAMP NOT NULL DEFAULT now(),
  updated_at     TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_salpyeo_users_sns ON salpyeo_users (sns_type, sns_id) WHERE deleted_at IS NULL;
