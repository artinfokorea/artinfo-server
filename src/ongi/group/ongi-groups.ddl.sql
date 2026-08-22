-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 가족 공간 (그룹)
CREATE TABLE IF NOT EXISTS ongi_groups (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR NOT NULL,
  invite_code       VARCHAR(16) NOT NULL,
  invite_expires_at TIMESTAMP NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT now(),
  updated_at        TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_groups_invite_code ON ongi_groups (invite_code) WHERE deleted_at IS NULL;

-- 온기 그룹 구성원 (사용자 × 그룹 — 호칭은 그룹마다 다름)
CREATE TABLE IF NOT EXISTS ongi_members (
  id         SERIAL PRIMARY KEY,
  group_id   INTEGER NOT NULL,
  user_id    INTEGER NOT NULL,
  name       VARCHAR NOT NULL,
  role       VARCHAR(16) NOT NULL DEFAULT 'member',
  avatar_url VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_members_group_user ON ongi_members (group_id, user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ongi_members_user ON ongi_members (user_id);

-- 온기 사용자 차단 (2026-08-22 추가) — 차단한 사용자의 사진·댓글을 숨긴다
CREATE TABLE IF NOT EXISTS ongi_blocks (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL,
  blocked_user_id INTEGER NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_blocks_user_blocked ON ongi_blocks (user_id, blocked_user_id);
