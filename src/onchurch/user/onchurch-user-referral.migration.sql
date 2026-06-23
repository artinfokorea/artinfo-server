-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 가입 시 유입경로(referral) 수집: 네이버/인스타그램/메일/기타.
-- referral_source: 'naver' | 'instagram' | 'mail' | 'etc'
-- referral_source_etc: referral_source 가 'etc' 일 때 직접 입력한 내용 (그 외 NULL).
ALTER TABLE onchurch_users
  ADD COLUMN IF NOT EXISTS referral_source varchar NULL,
  ADD COLUMN IF NOT EXISTS referral_source_etc varchar NULL;
