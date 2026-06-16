-- onchurch 라이브 방송 기능: onchurch_churches 컬럼 추가
-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS live_channel_id varchar,
  ADD COLUMN IF NOT EXISTS is_live boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS live_started_at timestamp;
