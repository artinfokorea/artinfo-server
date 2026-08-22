-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 인물 태그 대상 (구성원이 아닌 아이 등 포함)
CREATE TABLE IF NOT EXISTS ongi_people (
  id         SERIAL PRIMARY KEY,
  group_id   INTEGER NOT NULL,
  name       VARCHAR NOT NULL,
  image_url  VARCHAR,
  member_id  INTEGER, -- 구성원에서 자동 생성된 인물이면 해당 구성원 id (수동 추가는 NULL)
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ongi_people_group ON ongi_people (group_id);

-- 기존 DB 마이그레이션 (2026-08-22): 구성원 자동 인물 연동
ALTER TABLE ongi_people ADD COLUMN IF NOT EXISTS member_id INTEGER;
-- 같은 구성원이 중복 인물로 생기지 않도록 (동시 조회 레이스 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ongi_people_member ON ongi_people (group_id, member_id) WHERE member_id IS NOT NULL AND deleted_at IS NULL;
