-- 사용자 일별 활동 (2026-09-29) — 관리자 지표(DAU·MAU·재방문율·체류시간)의 원본.
-- 기동 시 OngiSchemaBootstrapService 가 IF NOT EXISTS 로도 생성한다.
-- 사용자 × 날짜(한국 시간) 당 1행. 인증된 요청이 오면 행이 생기고(모든 앱 버전),
-- 사용 시간·방문 수·플랫폼·버전은 앱이 보내는 값(1.0.10 이상)으로 채운다.
CREATE TABLE IF NOT EXISTS ongi_user_daily_activity (
  user_id            INTEGER NOT NULL,
  day                DATE NOT NULL,                  -- 한국 시간 기준 날짜
  first_seen_at      TIMESTAMP NOT NULL DEFAULT now(),
  last_seen_at       TIMESTAMP NOT NULL DEFAULT now(),
  foreground_seconds INTEGER NOT NULL DEFAULT 0,     -- 앱을 화면에 띄워 둔 시간 (하루 최대 86400)
  session_count      INTEGER NOT NULL DEFAULT 0,     -- 방문 수 (5분 넘게 떠났다 돌아오면 새 방문)
  platform           VARCHAR(16),                    -- ios | android, 앱이 보내기 전에는 NULL
  app_version        VARCHAR(16),
  PRIMARY KEY (user_id, day)
);
CREATE INDEX IF NOT EXISTS idx_ongi_user_daily_activity_day ON ongi_user_daily_activity (day);
