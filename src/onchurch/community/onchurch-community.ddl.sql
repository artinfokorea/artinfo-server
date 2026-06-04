-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.
-- (다른 onchurch 테이블과 동일하게 수동 적용)

-- 교제 게시판 카테고리 (관리자 정의)
CREATE TABLE IF NOT EXISTS onchurch_community_categories (
  id          SERIAL PRIMARY KEY,
  church_id   INTEGER NOT NULL,
  name        VARCHAR(120) NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_community_categories_church ON onchurch_community_categories (church_id);

-- 교제 게시글 (성도 작성, 즉시 공개 + 사후 관리)
CREATE TABLE IF NOT EXISTS onchurch_community_posts (
  id           SERIAL PRIMARY KEY,
  church_id    INTEGER NOT NULL,
  author_id    INTEGER NOT NULL,
  author_name  VARCHAR(80) NOT NULL,
  category     VARCHAR(50),
  title        VARCHAR(300) NOT NULL,
  content      TEXT,
  photo_urls   JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url    VARCHAR(1000),
  is_hidden    BOOLEAN NOT NULL DEFAULT false,
  report_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_community_posts_church ON onchurch_community_posts (church_id);
CREATE INDEX IF NOT EXISTS idx_onchurch_community_posts_church_created ON onchurch_community_posts (church_id, created_at DESC);

-- 3) 기존 모든 교회에 기본 카테고리 시드 (이미 카테고리가 있는 교회는 건너뜀)
--    신규 가입 교회는 프론트 기본 카테고리 폴백 + 관리자 '기본 카테고리 추가' 버튼으로 처리됨.
INSERT INTO onchurch_community_categories (church_id, name, sort_order, is_active)
SELECT c.id, d.name, d.sort_order, true
FROM onchurch_churches c
CROSS JOIN (VALUES
  ('간증', 0),
  ('감사', 1),
  ('일상 나눔', 2),
  ('기도 부탁', 3),
  ('질문', 4),
  ('자유', 5)
) AS d(name, sort_order)
WHERE c.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM onchurch_community_categories x WHERE x.church_id = c.id
  );
