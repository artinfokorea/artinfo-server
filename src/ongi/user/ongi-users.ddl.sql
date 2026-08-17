-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 사용자 (계정 — SNS 로그인 기준)
CREATE TABLE IF NOT EXISTS ongi_users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR NOT NULL,
  sns_type       VARCHAR(16) NOT NULL,
  sns_id         VARCHAR NOT NULL,
  icon_image_url VARCHAR,
  email          VARCHAR,
  created_at     TIMESTAMP NOT NULL DEFAULT now(),
  updated_at     TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_users_sns ON ongi_users (sns_type, sns_id) WHERE deleted_at IS NULL;
