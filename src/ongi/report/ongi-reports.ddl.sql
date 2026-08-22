-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 신고 (사진·댓글·구성원) — 운영자가 24시간 내 검토·조치 (App Store 1.2)
CREATE TABLE IF NOT EXISTS ongi_reports (
  id               SERIAL PRIMARY KEY,
  reporter_user_id INTEGER NOT NULL,
  target_type      VARCHAR(16) NOT NULL, -- photo | comment | member
  target_id        INTEGER NOT NULL,
  reason           VARCHAR NOT NULL,
  status           VARCHAR(16) NOT NULL DEFAULT 'open', -- open | resolved
  created_at       TIMESTAMP NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ongi_reports_status_created ON ongi_reports (status, created_at DESC);
