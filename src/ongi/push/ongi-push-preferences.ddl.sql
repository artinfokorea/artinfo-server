-- 온기 푸시 종류별 수신 설정 (사용자당 1행, 없으면 전부 켜짐). 기동 시 OngiSchemaBootstrapService 가 IF NOT EXISTS 로도 생성한다.
CREATE TABLE IF NOT EXISTS ongi_push_preferences (
  user_id         INTEGER PRIMARY KEY,
  photo_enabled   BOOLEAN NOT NULL DEFAULT true,
  comment_enabled BOOLEAN NOT NULL DEFAULT true,
  like_enabled    BOOLEAN NOT NULL DEFAULT true,
  event_enabled   BOOLEAN NOT NULL DEFAULT true,
  family_enabled  BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMP NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP NOT NULL DEFAULT now()
);
