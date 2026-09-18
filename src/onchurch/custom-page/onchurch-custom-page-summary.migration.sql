-- 커스텀 페이지에 한 줄 설명(summary) 컬럼 추가
-- 공개 페이지에서 제목 아래에 들어가는 안내 문구로, 고정 페이지들의 설명과 같은 자리다.
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
ALTER TABLE onchurch_custom_pages
  ADD COLUMN IF NOT EXISTS summary varchar(200) NULL;
