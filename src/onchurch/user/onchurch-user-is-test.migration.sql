-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 테스트용 계정 플래그. true인 유저와 그 유저가 소유한 교회는 마스터 대시보드 통계에서 제외한다.
ALTER TABLE onchurch_users
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
