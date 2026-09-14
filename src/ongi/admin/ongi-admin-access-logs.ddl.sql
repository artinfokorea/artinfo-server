-- 운영자 사진 열람 기록 (2026-09-14) — bootstrap 이 기동 시 자동 생성
-- 개인정보 처리방침 5·7조: 운영 책임자의 가족 사진 열람은 모두 기록한다
CREATE TABLE IF NOT EXISTS ongi_admin_access_logs (
  id            SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL,
  action        VARCHAR(32) NOT NULL,
  target_type   VARCHAR(16) NOT NULL,
  target_id     INTEGER NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ongi_admin_access_logs_created ON ongi_admin_access_logs (created_at DESC);
