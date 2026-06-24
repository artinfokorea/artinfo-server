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
