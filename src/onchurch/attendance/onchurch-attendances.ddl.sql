-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 출석 기록 (출석 1건 = 성도 × 날짜 × 예배종류)
CREATE TABLE IF NOT EXISTS onchurch_attendances (
  id           SERIAL PRIMARY KEY,
  church_id    INTEGER NOT NULL,
  saint_id     INTEGER NOT NULL,
  date         VARCHAR(10) NOT NULL,
  service_type VARCHAR(40) NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onchurch_attendances_church ON onchurch_attendances (church_id);
CREATE INDEX IF NOT EXISTS idx_onchurch_attendances_session ON onchurch_attendances (church_id, date, service_type);
CREATE INDEX IF NOT EXISTS idx_onchurch_attendances_saint ON onchurch_attendances (church_id, saint_id);
