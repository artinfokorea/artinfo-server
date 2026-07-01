-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 1) 섬김의 사람들: 연락처(phone)/이메일(email) 컬럼 추가.
-- 2) 활성/비활성(is_active) 기능 제거: 비전·연혁·섬김의 사람들.
--    (이후 모든 항목이 항상 공개됨)
ALTER TABLE onchurch_staffs ADD COLUMN IF NOT EXISTS phone VARCHAR(40);
ALTER TABLE onchurch_staffs ADD COLUMN IF NOT EXISTS email VARCHAR(200);

ALTER TABLE onchurch_staffs DROP COLUMN IF EXISTS is_active;
ALTER TABLE onchurch_visions DROP COLUMN IF EXISTS is_active;
ALTER TABLE onchurch_histories DROP COLUMN IF EXISTS is_active;
