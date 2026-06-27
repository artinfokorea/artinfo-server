-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 심방 기록
CREATE TABLE IF NOT EXISTS onchurch_visitations (
  id          SERIAL PRIMARY KEY,
  church_id   INTEGER NOT NULL,
  saint_id    INTEGER,
  saint_name  VARCHAR(80) NOT NULL,
  participants TEXT,
  minister    VARCHAR(80) NOT NULL,
  type        VARCHAR(40) NOT NULL,
  visit_date  VARCHAR(10) NOT NULL,
  content     TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_visitations_church ON onchurch_visitations (church_id);
CREATE INDEX IF NOT EXISTS idx_onchurch_visitations_church_date ON onchurch_visitations (church_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_onchurch_visitations_saint ON onchurch_visitations (church_id, saint_id);

-- 교회별 커스터마이징 가능한 심방 종류
-- 기본값(대심방·일반심방·전화심방·기타심방)은 최초 조회 시 서버가 자동 시드한다.
CREATE TABLE IF NOT EXISTS onchurch_visitation_types (
  id          SERIAL PRIMARY KEY,
  church_id   INTEGER NOT NULL,
  name        VARCHAR(40) NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_visitation_types_church ON onchurch_visitation_types (church_id);

-- 이미 onchurch_visitations 를 만든 뒤 participants 컬럼이 추가된 경우:
ALTER TABLE onchurch_visitations ADD COLUMN IF NOT EXISTS participants TEXT;
