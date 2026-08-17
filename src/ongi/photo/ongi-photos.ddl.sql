-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 사진 (그룹 피드 게시물 — 같은 업로드라도 그룹마다 독립 레코드)
CREATE TABLE IF NOT EXISTS ongi_photos (
  id               SERIAL PRIMARY KEY,
  group_id         INTEGER NOT NULL,
  author_member_id INTEGER NOT NULL,
  album_id         INTEGER,
  url              VARCHAR NOT NULL,
  aspect_ratio     DOUBLE PRECISION NOT NULL DEFAULT 1,
  caption          VARCHAR,
  location         VARCHAR,
  person_ids       JSONB NOT NULL DEFAULT '[]'::jsonb,
  like_count       INTEGER NOT NULL DEFAULT 0,
  comment_count    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ongi_photos_group_created ON ongi_photos (group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ongi_photos_album ON ongi_photos (album_id);
CREATE INDEX IF NOT EXISTS idx_ongi_photos_author ON ongi_photos (author_member_id);
CREATE INDEX IF NOT EXISTS idx_ongi_photos_person_ids ON ongi_photos USING GIN (person_ids);

-- 온기 따뜻해요 (사용자 × 사진)
CREATE TABLE IF NOT EXISTS ongi_photo_likes (
  id         SERIAL PRIMARY KEY,
  photo_id   INTEGER NOT NULL,
  user_id    INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_photo_likes_photo_user ON ongi_photo_likes (photo_id, user_id);

-- 온기 사진 댓글
CREATE TABLE IF NOT EXISTS ongi_photo_comments (
  id               SERIAL PRIMARY KEY,
  photo_id         INTEGER NOT NULL,
  author_member_id INTEGER NOT NULL,
  text             VARCHAR NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ongi_photo_comments_photo ON ongi_photo_comments (photo_id);
