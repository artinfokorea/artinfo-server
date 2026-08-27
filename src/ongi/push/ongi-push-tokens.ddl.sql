-- 온기 푸시 토큰 (기기별 Expo Push Token). 기동 시 OngiSchemaBootstrapService 가 IF NOT EXISTS 로도 생성한다.
CREATE TABLE IF NOT EXISTS ongi_push_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  token      VARCHAR NOT NULL,
  platform   VARCHAR(16) NOT NULL DEFAULT 'ios',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_push_tokens_token ON ongi_push_tokens (token);
CREATE INDEX IF NOT EXISTS idx_ongi_push_tokens_user ON ongi_push_tokens (user_id);
