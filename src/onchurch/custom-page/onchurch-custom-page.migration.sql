-- 커스텀 페이지(onchurch_custom_pages) 테이블 추가
-- 교회가 이름을 정해 직접 만드는 자유 페이지. 공개 경로는 /p/:slug 이며,
-- 본문은 블록 배열(jsonb)로 저장한다 — HTML을 저장하지 않으므로 렌더 시 sanitize가 필요 없다.
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
CREATE TABLE IF NOT EXISTS onchurch_custom_pages (
  id          serial PRIMARY KEY,
  church_id   int NOT NULL,
  slug        varchar(80) NOT NULL,
  title       varchar(100) NOT NULL,
  blocks      jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order  int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamp NOT NULL DEFAULT now(),
  updated_at  timestamp NOT NULL DEFAULT now(),
  deleted_at  timestamp NULL
);

-- 같은 교회 안에서 slug 는 유일하다. 소프트 삭제된 행은 제외해 slug 재사용을 허용한다.
CREATE UNIQUE INDEX IF NOT EXISTS ux_onchurch_custom_pages_church_slug
  ON onchurch_custom_pages (church_id, slug)
  WHERE deleted_at IS NULL;

-- 네비 구성 시 교회별 활성 페이지를 순서대로 읽는다.
CREATE INDEX IF NOT EXISTS ix_onchurch_custom_pages_church_sort
  ON onchurch_custom_pages (church_id, sort_order);
