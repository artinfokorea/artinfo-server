-- 재무관리(가계부) 구독 수입 재집계용 1회성 스크립트. 운영 DB에 직접 실행합니다.
--   기존 가계부 내역을 모두 지우고, 교회별 결제 기간을 금액으로 환산해 수입(income)으로 다시 기입한다.
--   금액 규칙은 마스터 페이지의 결제 만료일 연장 시 자동 기록과 동일하다.
--     · 같은 일자로 한 달 뒤 = 1개월 = 10,000원 (예: 9/14 → 10/14)
--     · 같은 일자로 1년 뒤   = 12개월 = 100,000원 (예: 2026-09-14 → 2027-09-14)
--     · 개월이 온전히 차지 않는 잔여일(예: 9/14 → 10/13)은 금액으로 치지 않는다.
--   결제 기간의 시작점은 무료체험 종료일(free_trial_until), 없으면 교회 생성일로 본다.
--   거래 일자(entry_date)는 결제 시작일로 남긴다.
--   테스트 계정(owner.is_test) 및 삭제된 교회·유저는 제외한다.

-- ── 1) 미리보기: 먼저 이 SELECT만 돌려 교회별 산정 결과를 확인하세요. ──────────────
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
    -- 온전히 채운 개월 수. 일자가 시작일보다 앞서면 한 달을 덜 채운 것으로 보되,
    -- 그 달의 마지막 날(1/31 → 2/28 처럼 달 길이 때문에 밀린 경우)이면 채운 것으로 본다.
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
SELECT
  church_id,
  church_name,
  base_date,
  paid_date,
  months,
  (months / 12) * 100000 + (months % 12) * 10000 AS amount
FROM priced
WHERE months > 0
ORDER BY base_date, church_id;

-- ── 2) 실제 반영: 위 미리보기가 맞으면 아래 블록을 실행하세요. ────────────────────
-- BEGIN;
--
-- -- 기존 내역 전부 삭제(수입·지출 모두). 지출 기록을 남기려면 WHERE type = 'income' 을 붙이세요.
-- DELETE FROM onchurch_ledger_entries;
--
-- WITH calc AS (
--   SELECT
--     c.id AS church_id,
--     c.name AS church_name,
--     COALESCE(
--       (u.free_trial_until AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date,
--       (c.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date
--     ) AS base_date,
--     (u.paid_until AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date AS paid_date
--   FROM onchurch_churches c
--   JOIN onchurch_users u ON u.id = c.owner_id
--   WHERE u.paid_until IS NOT NULL
--     AND u.is_test = false
--     AND u.deleted_at IS NULL
--     AND c.deleted_at IS NULL
-- ), priced AS (
--   SELECT
--     church_id,
--     church_name,
--     base_date,
--     paid_date,
--     (
--       (EXTRACT(YEAR FROM paid_date) - EXTRACT(YEAR FROM base_date)) * 12
--       + (EXTRACT(MONTH FROM paid_date) - EXTRACT(MONTH FROM base_date))
--       - CASE
--           WHEN EXTRACT(DAY FROM paid_date) < EXTRACT(DAY FROM base_date)
--            AND paid_date <> (date_trunc('month', paid_date) + interval '1 month - 1 day')::date
--           THEN 1 ELSE 0
--         END
--     )::int AS months
--   FROM calc
-- )
-- INSERT INTO onchurch_ledger_entries (entry_date, type, amount, category, memo, created_by)
-- SELECT
--   base_date,
--   'income',
--   (months / 12) * 100000 + (months % 12) * 10000,
--   '구독료',
--   church_name || ' ' || months || '개월 (' || base_date || ' ~ ' || paid_date || ')',
--   (SELECT id FROM onchurch_users WHERE role = 'master' AND deleted_at IS NULL ORDER BY id LIMIT 1)
-- FROM priced
-- WHERE months > 0;
--
-- COMMIT;
