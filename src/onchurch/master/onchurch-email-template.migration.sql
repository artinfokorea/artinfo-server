-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 마스터 대량 메일 템플릿 저장 테이블. (제목·본문을 저장해두고 불러쓰기)

CREATE TABLE IF NOT EXISTS onchurch_email_templates (
  id         SERIAL PRIMARY KEY,
  owner_id   INTEGER NOT NULL,
  name       VARCHAR NOT NULL,
  subject    VARCHAR NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
