-- 갤러리 사진 공개 범위 ('public' 전체공개 | 'member' 회원공개). 기본은 전체공개.
-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.
ALTER TABLE onchurch_galleries
  ADD COLUMN IF NOT EXISTS visibility varchar(16) NOT NULL DEFAULT 'public';
