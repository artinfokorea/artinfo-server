-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 성도 명부
CREATE TABLE IF NOT EXISTS onchurch_saints (
  id              SERIAL PRIMARY KEY,
  church_id       INTEGER NOT NULL,
  name            VARCHAR(80) NOT NULL,
  photo_url       VARCHAR(1000),
  birth_date      VARCHAR(10),
  gender          VARCHAR(10),
  phone           VARCHAR(40),
  email           VARCHAR(200),
  address         VARCHAR(500),
  position        VARCHAR(40),
  ordination_date VARCHAR(10),
  faith_level     VARCHAR(40),
  created_at      TIMESTAMP NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_saints_church ON onchurch_saints (church_id);
CREATE INDEX IF NOT EXISTS idx_onchurch_saints_church_name ON onchurch_saints (church_id, name);

-- 성도 간 가족관계 (양방향으로 한 쌍씩 저장 — A→B, B→A)
CREATE TABLE IF NOT EXISTS onchurch_saint_relations (
  id               SERIAL PRIMARY KEY,
  church_id        INTEGER NOT NULL,
  saint_id         INTEGER NOT NULL,
  related_saint_id INTEGER NOT NULL,
  relation         VARCHAR(40) NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_saint_relations_church ON onchurch_saint_relations (church_id);
CREATE INDEX IF NOT EXISTS idx_onchurch_saint_relations_saint ON onchurch_saint_relations (church_id, saint_id);

-- 성도 관리자용 메모(성도 상세 '메모' 탭)
ALTER TABLE onchurch_saints ADD COLUMN IF NOT EXISTS memo TEXT;

-- 성도 즐겨찾기(출석체크 상단 고정)
ALTER TABLE onchurch_saints ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;

-- 성도별 기도목록(성도 상세 '기도목록' 탭)
CREATE TABLE IF NOT EXISTS onchurch_saint_prayers (
  id          SERIAL PRIMARY KEY,
  church_id   INTEGER NOT NULL,
  saint_id    INTEGER NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_saint_prayers_church ON onchurch_saint_prayers (church_id);
CREATE INDEX IF NOT EXISTS idx_onchurch_saint_prayers_saint ON onchurch_saint_prayers (church_id, saint_id);

-- 교회별 커스터마이징 가능한 성도 태그 정의
-- 기본값(청년부·여전도회·남전도회)은 최초 조회 시 서버가 자동 시드한다.
CREATE TABLE IF NOT EXISTS onchurch_saint_tags (
  id          SERIAL PRIMARY KEY,
  church_id   INTEGER NOT NULL,
  name        VARCHAR(40) NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_saint_tags_church ON onchurch_saint_tags (church_id);

-- 성도 ↔ 태그 연결(다대다)
CREATE TABLE IF NOT EXISTS onchurch_saint_tag_links (
  id          SERIAL PRIMARY KEY,
  church_id   INTEGER NOT NULL,
  saint_id    INTEGER NOT NULL,
  tag_id      INTEGER NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_saint_tag_links_church ON onchurch_saint_tag_links (church_id);
CREATE INDEX IF NOT EXISTS idx_onchurch_saint_tag_links_saint ON onchurch_saint_tag_links (church_id, saint_id);
CREATE INDEX IF NOT EXISTS idx_onchurch_saint_tag_links_tag ON onchurch_saint_tag_links (church_id, tag_id);
