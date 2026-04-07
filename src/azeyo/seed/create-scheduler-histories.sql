CREATE TABLE IF NOT EXISTS azeyo_scheduler_histories (
  id SERIAL PRIMARY KEY,
  scheduler_name VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  result TEXT,
  error_message TEXT,
  duration_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduler_histories_name_created
  ON azeyo_scheduler_histories (scheduler_name, created_at DESC);
