-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- 온기 사용자 (계정 — SNS 로그인 기준)
CREATE TABLE IF NOT EXISTS ongi_users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR NOT NULL,
  sns_type       VARCHAR(16) NOT NULL,
  sns_id         VARCHAR NOT NULL,
  icon_image_url VARCHAR,
  email          VARCHAR,
  created_at     TIMESTAMP NOT NULL DEFAULT now(),
  updated_at     TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_users_sns ON ongi_users (sns_type, sns_id) WHERE deleted_at IS NULL;

-- 사용자 등급 (2026-09-14) — bootstrap 이 기동 시 자동 적용. SUPER_ADMIN 지정은 DB 에서만:
--   UPDATE ongi_users SET type = 'SUPER_ADMIN' WHERE id = <내 id>;
ALTER TABLE ongi_users ADD COLUMN IF NOT EXISTS type VARCHAR(16) NOT NULL DEFAULT 'USER';

-- 테스트 계정 (2026-09-29) — bootstrap 이 기동 시 자동 적용. 관리자 수치(운영 현황 · 지표)에서 뺀다.
-- 관리자 조회(raw SQL)만 읽고 쓰므로 엔티티에는 매핑하지 않는다 — 컬럼이 없어도 앱 API 는 영향이 없다.
ALTER TABLE ongi_users ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
