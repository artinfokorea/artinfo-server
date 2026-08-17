-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 로그인 세션 (발급된 access/refresh 토큰)
CREATE TABLE IF NOT EXISTS ongi_auths (
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
CREATE INDEX IF NOT EXISTS idx_ongi_auths_user ON ongi_auths (user_id);
CREATE INDEX IF NOT EXISTS idx_ongi_auths_tokens ON ongi_auths (access_token, refresh_token);
