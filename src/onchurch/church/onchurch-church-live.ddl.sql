-- onchurch 라이브 방송 기능: onchurch_churches 컬럼 추가
-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS live_url varchar,
  ADD COLUMN IF NOT EXISTS is_live boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS live_started_at timestamp;
-- (live_channel_id 컬럼은 더 이상 사용하지 않습니다. 이미 추가했다면 그대로 두어도 무방합니다.)
