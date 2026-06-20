-- onchurch_church 에 네이버 사이트 인증 코드 컬럼 추가
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS naver_verification varchar NULL;
