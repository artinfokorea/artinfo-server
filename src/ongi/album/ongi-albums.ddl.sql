-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 앨범
CREATE TABLE IF NOT EXISTS ongi_albums (
  id         SERIAL PRIMARY KEY,
  group_id   INTEGER NOT NULL,
  title      VARCHAR NOT NULL,
  cover_url  VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ongi_albums_group ON ongi_albums (group_id);
