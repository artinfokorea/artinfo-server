-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 서비스 운영 가계부 테이블.
--   거래일(entry_date)별로 수입(income)/지출(expense)을, 금액(amount)과
--   항목·수단(category) 및 메모(memo)와 함께 기록한다. 금액은 항상 양수로 저장하고 type으로 구분.

CREATE TABLE IF NOT EXISTS onchurch_ledger_entries (
  id          SERIAL PRIMARY KEY,
  entry_date  DATE NOT NULL,
  type        VARCHAR NOT NULL,
  amount      INTEGER NOT NULL,
  category    VARCHAR NOT NULL,
  memo        TEXT,
  created_by  INTEGER NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onchurch_ledger_entry_date ON onchurch_ledger_entries (entry_date DESC);
