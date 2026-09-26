-- 온기 앱 내 알림 목록 (푸시 발송 시 수신자마다 1행, 30일 보관) + 마지막으로 목록을 연 시각. 기동 시 OngiSchemaBootstrapService 가 IF NOT EXISTS 로도 생성한다.
CREATE TABLE IF NOT EXISTS ongi_notifications (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  type          VARCHAR(32) NOT NULL,
  title         VARCHAR NOT NULL,
  body          TEXT NOT NULL,
  data          JSONB NOT NULL DEFAULT '{}',
  actor_user_id INTEGER,
  created_at    TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ongi_notifications_user_created ON ongi_notifications (user_id, created_at);

CREATE TABLE IF NOT EXISTS ongi_notification_seen (
  user_id INTEGER PRIMARY KEY,
  seen_at TIMESTAMP NOT NULL
);
