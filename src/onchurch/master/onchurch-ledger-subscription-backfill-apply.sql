-- [실제 반영] 가계부 내역을 전부 지우고 구독 수입을 다시 기입한다. 되돌릴 수 없으므로
-- 반드시 onchurch-ledger-subscription-backfill.sql(미리보기)로 결과를 먼저 확인한 뒤 실행한다.
-- 산정 규칙은 미리보기 파일과 동일하며, 거래 일자(entry_date)는 결제 시작일로 남긴다.
-- 한 트랜잭션으로 묶여 있어 중간에 실패하면 전부 취소된다.

BEGIN;

-- 기존 내역 전부 삭제(수입·지출 모두).
-- 수기로 넣은 지출 기록을 남기려면 아래 줄 끝에 WHERE type = 'income' 을 붙인다.
DELETE FROM onchurch_ledger_entries;

WITH calc AS (
  SELECT
    c.id AS church_id,
    c.name AS church_name,
    COALESCE(
      (u.free_trial_until AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date,
      (c.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date
    ) AS base_date,
    (u.paid_until AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date AS paid_date
  FROM onchurch_churches c
  JOIN onchurch_users u ON u.id = c.owner_id
  WHERE u.paid_until IS NOT NULL
    AND u.is_test = false
    AND u.deleted_at IS NULL
    AND c.deleted_at IS NULL
), priced AS (
  SELECT
    church_id,
    church_name,
    base_date,
    paid_date,
    (
      (EXTRACT(YEAR FROM paid_date) - EXTRACT(YEAR FROM base_date)) * 12
      + (EXTRACT(MONTH FROM paid_date) - EXTRACT(MONTH FROM base_date))
      - CASE
          WHEN EXTRACT(DAY FROM paid_date) < EXTRACT(DAY FROM base_date)
           AND paid_date <> (date_trunc('month', paid_date) + interval '1 month - 1 day')::date
          THEN 1 ELSE 0
        END
    )::int AS months
  FROM calc
)
INSERT INTO onchurch_ledger_entries (entry_date, type, amount, category, memo, created_by)
SELECT
  base_date,
  'income',
  (months / 12) * 100000 + (months % 12) * 10000,
  '구독료',
  church_name || ' ' || months || '개월 (' || base_date || ' ~ ' || paid_date || ')',
  (SELECT id FROM onchurch_users WHERE role = 'master' AND deleted_at IS NULL ORDER BY id LIMIT 1)
FROM priced
WHERE months > 0;

COMMIT;
