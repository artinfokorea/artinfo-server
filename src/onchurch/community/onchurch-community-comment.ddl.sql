-- 교제 게시글 댓글. synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.
CREATE TABLE IF NOT EXISTS onchurch_community_comments (
  id          SERIAL PRIMARY KEY,
  church_id   INTEGER NOT NULL,
  post_id     INTEGER NOT NULL,
  author_id   INTEGER NOT NULL,
  author_name VARCHAR(80) NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_community_comments_post ON onchurch_community_comments (church_id, post_id);
