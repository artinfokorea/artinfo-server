-- 앱 설정 키-값 (강제 업데이트 버전 등) — 배포 시 bootstrap 이 자동 생성
CREATE TABLE IF NOT EXISTS ongi_configs (
  key   VARCHAR PRIMARY KEY,
  value VARCHAR NOT NULL
);
INSERT INTO ongi_configs (key, value) VALUES ('min_ios_version', '1.0.0'), ('latest_ios_version', '1.0.1') ON CONFLICT (key) DO NOTHING;
