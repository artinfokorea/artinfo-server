-- onchurch_churches 에 추천인 이벤트 컬럼 추가
--  - referral_code: 교회가 다른 교회에게 알려주는 자기 추천 코드(6자). 관리자 결제 화면 첫 조회 시 생성된다.
--  - referred_by_church_id: 이 교회가 입력한 추천인 교회 id. 가입 단계 또는 첫 결제 확인 전까지 1회만 입력 가능.
-- 보상(기간 연장)은 마스터가 교회 목록의 '추천' 열을 보고 수동으로 처리한다.
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS referral_code varchar NULL,
  ADD COLUMN IF NOT EXISTS referred_by_church_id int NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_onchurch_churches_referral_code
  ON onchurch_churches (referral_code)
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_onchurch_churches_referred_by_church_id
  ON onchurch_churches (referred_by_church_id)
  WHERE referred_by_church_id IS NOT NULL;
