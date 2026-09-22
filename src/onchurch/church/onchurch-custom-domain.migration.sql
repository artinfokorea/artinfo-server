-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 교회 자체 도메인 연결.
--   교회가 보유한 도메인(대표 호스트)을 그 교회 홈페이지에 연결한다. 값이 있으면 프론트 미들웨어가
--   요청 Host 로 교회를 찾아 해당 교회 사이트를 서빙하고, {slug}.everychurch.co.kr 은 이 주소로 308 리다이렉트한다.
--   한 호스트는 한 교회에만 연결된다(부분 유니크 인덱스).

ALTER TABLE onchurch_churches ADD COLUMN IF NOT EXISTS custom_domain VARCHAR NULL;

CREATE UNIQUE INDEX IF NOT EXISTS onchurch_churches_custom_domain_uidx
  ON onchurch_churches (custom_domain)
  WHERE custom_domain IS NOT NULL;
