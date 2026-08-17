-- onchurch 배너 영상 지원: 컬럼 추가
-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.
ALTER TABLE onchurch_banners
  ADD COLUMN IF NOT EXISTS video_url varchar(1000);

-- 홈 배너 노출 타입 ('image' | 'video'). 두 타입 배너를 모두 보관하고 노출만 전환한다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS banner_type varchar NOT NULL DEFAULT 'image';
