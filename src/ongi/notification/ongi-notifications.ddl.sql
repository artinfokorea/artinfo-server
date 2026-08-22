-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 인앱 알림 (사진 업로드·따뜻해요·댓글)
CREATE TABLE IF NOT EXISTS ongi_notifications (
  id                SERIAL PRIMARY KEY,
  recipient_user_id INTEGER NOT NULL,
  group_id          INTEGER NOT NULL,
  type              VARCHAR NOT NULL, -- PHOTO_UPLOADED | PHOTO_LIKED | COMMENT_ADDED
  message           VARCHAR NOT NULL, -- 생성 시점에 완성된 한국어 문구 (행위자 이름 포함)
  actor_member_id   INTEGER,
  photo_id          INTEGER,
  photo_url         VARCHAR,
  read_at           TIMESTAMP,
  created_at        TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ongi_notifications_recipient ON ongi_notifications (recipient_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ongi_notifications_unread ON ongi_notifications (recipient_user_id) WHERE read_at IS NULL;
