-- onchurch_churches 에 공개 사이트 언어(site_lang) 컬럼 추가
-- 공개 교회 사이트의 고정 UI 문구를 한국어('ko')/영어('en') 중 선택해 렌더한다.
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS site_lang varchar NOT NULL DEFAULT 'ko';
