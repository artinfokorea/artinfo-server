-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 홈 '바로가기' 선택/순서 저장용 컬럼 + 인스타그램 URL 컬럼 추가.
ALTER TABLE onchurch_churches ADD COLUMN IF NOT EXISTS instagram_url VARCHAR;
ALTER TABLE onchurch_churches ADD COLUMN IF NOT EXISTS home_quick_links JSONB NOT NULL DEFAULT '[]'::jsonb;
