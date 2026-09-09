-- 살펴 로그인 세션 (발급된 access/refresh 토큰). 기동 시 SalpyeoSchemaBootstrapService 가 멱등 생성한다.
CREATE TABLE IF NOT EXISTS salpyeo_auths (
  id                       SERIAL PRIMARY KEY,
  type                     VARCHAR(16) NOT NULL,
  user_id                  INTEGER NOT NULL,
  access_token             VARCHAR NOT NULL,
  access_token_expires_in  TIMESTAMP NOT NULL,
  refresh_token            VARCHAR NOT NULL,
  refresh_token_expires_in TIMESTAMP NOT NULL,
  created_at               TIMESTAMP NOT NULL DEFAULT now(),
  updated_at               TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_salpyeo_auths_user ON salpyeo_auths (user_id);
CREATE INDEX IF NOT EXISTS idx_salpyeo_auths_tokens ON salpyeo_auths (access_token, refresh_token);
