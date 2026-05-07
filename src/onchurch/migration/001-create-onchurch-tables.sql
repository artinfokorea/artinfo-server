-- onchurch 패키지 초기 스키마
-- artinfo-server 는 TypeORM synchronize:false 운영. 이 SQL 을 수동 실행하여 테이블 생성.

-- 1) onchurch_users
CREATE TYPE onchurch_user_role AS ENUM ('admin', 'member');

CREATE TABLE IF NOT EXISTS onchurch_users (
  id                BIGSERIAL PRIMARY KEY,
  login_id          VARCHAR(255) NOT NULL UNIQUE,
  password          VARCHAR(255) NOT NULL,
  name              VARCHAR(255) NOT NULL,
  phone             VARCHAR(20)  NOT NULL,
  role              onchurch_user_role NOT NULL DEFAULT 'member',
  church_name       VARCHAR(255),
  church_id         INTEGER,
  marketing_consent BOOLEAN      NOT NULL DEFAULT false,
  created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_onchurch_users_phone ON onchurch_users (phone);

-- 2) onchurch_auths
CREATE TABLE IF NOT EXISTS onchurch_auths (
  id                         BIGSERIAL PRIMARY KEY,
  user_id                    BIGINT      NOT NULL,
  access_token               TEXT        NOT NULL,
  access_token_expires_in    TIMESTAMP   NOT NULL,
  refresh_token              TEXT        NOT NULL,
  refresh_token_expires_in   TIMESTAMP   NOT NULL,
  created_at                 TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMP   NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_onchurch_auths_user FOREIGN KEY (user_id) REFERENCES onchurch_users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_onchurch_auths_user_id ON onchurch_auths (user_id);
CREATE INDEX IF NOT EXISTS idx_onchurch_auths_access_token ON onchurch_auths (access_token);
