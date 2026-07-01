-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 일정 공개/비공개(is_active) 기능 제거: 이후 모든 일정이 항상 공개됨.
ALTER TABLE onchurch_events DROP COLUMN IF EXISTS is_active;
