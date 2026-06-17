-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 마스터 대량 메일 발송 내역 저장 테이블.
--   누구에게(recipients) / 어떤 제목·본문(subject, content)을 / 언제(created_at) 보냈고
--   결과(total/sent/failed/failures)가 어땠는지 추후 확인하기 위함.

CREATE TABLE IF NOT EXISTS onchurch_email_logs (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER NOT NULL,
  sender_name VARCHAR NOT NULL,
  subject     VARCHAR NOT NULL,
  content     TEXT NOT NULL,
  recipients  JSONB NOT NULL,
  total       INTEGER NOT NULL,
  sent        INTEGER NOT NULL,
  failed      INTEGER NOT NULL,
  failures    JSONB NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onchurch_email_logs_created_at
  ON onchurch_email_logs (created_at DESC);
