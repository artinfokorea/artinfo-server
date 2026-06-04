-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 역할(role) 정합화: 가입 경로 기반 role 분기 도입에 따른 기존 데이터 보정.
--   - 랜딩 가입자/교회 운영자 → admin
--   - 교회 사이트에서 가입한 성도(church_id 설정됨) → member 유지
-- 관리 콘솔은 'admin'이거나 교회를 소유한 계정만 접근 가능하므로,
-- 교회 미소속(church_id IS NULL) 기존 계정을 admin으로 올려 접근이 막히지 않게 한다.

UPDATE onchurch_users
SET role = 'admin'
WHERE church_id IS NULL
  AND deleted_at IS NULL;

-- (방어적) 교회를 소유한 계정은 확실히 admin으로
UPDATE onchurch_users
SET role = 'admin'
WHERE deleted_at IS NULL
  AND id IN (SELECT owner_id FROM onchurch_churches WHERE owner_id IS NOT NULL);
