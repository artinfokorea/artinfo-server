-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 마스터 대량 메일 발송 내역 저장 테이블.
--   누구에게(results) / 어떤 제목·본문(subject, content)을 / 언제(created_at) 보냈고
--   각 주소가 성공(sent)·실패(failed)·제외(excluded)였는지 추후 확인하기 위함.
--   results 예: [{"email":"a@x.com","status":"sent","reason":null},
--                {"email":"b@y.com","status":"excluded","reason":"존재하지 않는 메일함"}]

CREATE TABLE IF NOT EXISTS onchurch_email_logs (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER NOT NULL,
  sender_name VARCHAR NOT NULL,
  subject     VARCHAR NOT NULL,
  content     TEXT NOT NULL,
  results     JSONB NOT NULL,
  total       INTEGER NOT NULL,
  sent        INTEGER NOT NULL,
  failed      INTEGER NOT NULL,
  excluded    INTEGER NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);
