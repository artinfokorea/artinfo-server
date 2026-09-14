-- 앱 문의 (2026-09-14) — bootstrap 이 기동 시 자동 생성
CREATE TABLE IF NOT EXISTS ongi_inquiries (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL,
  content             VARCHAR NOT NULL,
  answer              VARCHAR,
  answered_by_user_id INTEGER,
  answered_at         TIMESTAMP,
  created_at          TIMESTAMP NOT NULL DEFAULT now(),
  updated_at          TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ongi_inquiries_user ON ongi_inquiries (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ongi_inquiries_created ON ongi_inquiries (created_at DESC);
