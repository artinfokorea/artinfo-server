-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 인물 태그 대상 (구성원이 아닌 아이 등 포함)
CREATE TABLE IF NOT EXISTS ongi_people (
  id         SERIAL PRIMARY KEY,
  group_id   INTEGER NOT NULL,
  name       VARCHAR NOT NULL,
  image_url  VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ongi_people_group ON ongi_people (group_id);
