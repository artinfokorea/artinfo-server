-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 마스터 대량 문자 발송 내역 저장 테이블.
--   누구에게(results) / 어떤 제목·본문(subject, content)을 / 언제(created_at) 보냈고
--   각 번호가 성공(sent)·실패(failed)·제외(excluded)였는지 추후 확인하기 위함.
--   results 예: [{"phone":"01012345678","status":"sent","reason":null},
--                {"phone":"010","status":"excluded","reason":"유효하지 않은 휴대폰 번호"}]

CREATE TABLE IF NOT EXISTS onchurch_sms_logs (
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
