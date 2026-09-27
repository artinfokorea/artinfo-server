-- 채팅 (2026-09-27) — 가족 공간과 따로 존재하는 대화방. 공간을 나가도 방·메시지는 남는다.
-- 기동 시 OngiSchemaBootstrapService 가 IF NOT EXISTS 로도 생성한다.
CREATE TABLE IF NOT EXISTS ongi_chat_rooms (
  id              SERIAL PRIMARY KEY,
  type            VARCHAR(8) NOT NULL,             -- direct | group
  name            VARCHAR(30),                     -- 그룹방 이름 (없으면 참여자 이름으로 표시)
  direct_key      VARCHAR(32),                     -- 1:1 방만 '작은userId:큰userId' — 두 사람의 1:1 방은 하나
  creator_user_id INTEGER NOT NULL,
  last_message_id INTEGER,
  last_message_at TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_chat_rooms_direct_key ON ongi_chat_rooms (direct_key) WHERE direct_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS ongi_chat_participants (
  id                      SERIAL PRIMARY KEY,
  room_id                 INTEGER NOT NULL,
  user_id                 INTEGER NOT NULL,
  last_read_message_id    INTEGER NOT NULL DEFAULT 0,
  visible_from_message_id INTEGER NOT NULL DEFAULT 0, -- 이 id 이하 메시지는 안 보인다 (초대 전 · 1:1 방 삭제 후)
  left_at                 TIMESTAMP,                  -- 그룹방을 나간 시각 (다시 초대되면 NULL)
  created_at              TIMESTAMP NOT NULL DEFAULT now(),
  updated_at              TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_chat_participants_room_user ON ongi_chat_participants (room_id, user_id);
CREATE INDEX IF NOT EXISTS idx_ongi_chat_participants_user ON ongi_chat_participants (user_id);

CREATE TABLE IF NOT EXISTS ongi_chat_messages (
  id             SERIAL PRIMARY KEY,
  room_id        INTEGER NOT NULL,
  sender_user_id INTEGER,                          -- 시스템 메시지는 NULL
  type           VARCHAR(8) NOT NULL,              -- text | photo | system
  content        TEXT NOT NULL DEFAULT '',
  media_url      VARCHAR,
  thumb_url      VARCHAR,
  aspect_ratio   REAL NOT NULL DEFAULT 1,           -- 사진 가로/세로
  created_at     TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ongi_chat_messages_room_id ON ongi_chat_messages (room_id, id DESC);

