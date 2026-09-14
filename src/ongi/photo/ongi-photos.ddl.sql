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
  like_count       INTEGER NOT NULL DEFAULT 0,
  comment_count    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ongi_photos_group_created ON ongi_photos (group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ongi_photos_album ON ongi_photos (album_id);
CREATE INDEX IF NOT EXISTS idx_ongi_photos_author ON ongi_photos (author_member_id);

-- 인물 태그 제거 (2026-09-14) — 태그 UI 가 없어 쓰이지 않던 기능. 서버 배포(ongi_people·person_ids 참조 제거) 확인 후 실행
-- 응답의 personIds 는 1.0.6 앱 호환을 위해 서버가 빈 배열로 채운다 (DB 컬럼과 무관)
DROP INDEX IF EXISTS idx_ongi_photos_person_ids;
ALTER TABLE ongi_photos DROP COLUMN IF EXISTS person_ids;
DROP TABLE IF EXISTS ongi_people;

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

-- 목록용 축소본 (2026-08-31, 스크롤 성능) — 배포 시 bootstrap 이 자동 적용
ALTER TABLE ongi_photos ADD COLUMN IF NOT EXISTS thumb_url VARCHAR;
