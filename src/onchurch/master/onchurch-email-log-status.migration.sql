-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 대량 메일 발송을 큐(BullMQ) 기반 비동기로 전환하면서 발송 진행 상태를 기록할 컬럼을 추가한다.
--   queued     : 큐에 적재됨(아직 발송 시작 전)
--   processing : 워커가 발송 중(일부 결과 누적 중)
--   completed  : sent+failed+excluded == total (발송 종료)
-- 기존 행은 모두 동기 발송으로 이미 완료된 내역이므로 기본값 completed로 채운다.

ALTER TABLE onchurch_email_logs
  ADD COLUMN IF NOT EXISTS status VARCHAR NOT NULL DEFAULT 'completed';
