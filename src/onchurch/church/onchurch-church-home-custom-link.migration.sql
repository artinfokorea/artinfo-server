-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 홈 '바로가기' 커스텀 항목(제목·설명·이동 주소) 저장용 컬럼 추가.
ALTER TABLE onchurch_churches ADD COLUMN IF NOT EXISTS home_custom_link JSONB;
