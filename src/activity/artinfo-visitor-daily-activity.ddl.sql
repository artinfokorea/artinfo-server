-- 아트인포 방문자 일별 활동 (2026-11-02) — 관리자 지표(DAU·WAU·MAU·리텐션·체류시간)의 원본.
-- 기동 시 OngiSchemaBootstrapService 가 IF NOT EXISTS 로도 생성한다.
-- 방문자(브라우저마다 무작위 UUID) × 한국 날짜 당 1행. 비회원도 집계하고, 로그인 상태면 user_id 를 남긴다.
CREATE TABLE IF NOT EXISTS artinfo_visitor_daily_activity (
  visitor_id     VARCHAR(36) NOT NULL,               -- 브라우저 localStorage 의 UUID v4 (개인정보 아님)
  day            DATE NOT NULL,                      -- 한국 시간 기준 날짜
  user_id        INTEGER,                            -- 그날 로그인한 상태로 온 적이 있으면 회원 ID
  first_seen_at  TIMESTAMP NOT NULL DEFAULT now(),
  last_seen_at   TIMESTAMP NOT NULL DEFAULT now(),
  active_seconds INTEGER NOT NULL DEFAULT 0,         -- 탭이 화면에 보인 시간 (하루 최대 86400)
  session_count  INTEGER NOT NULL DEFAULT 0,         -- 방문 수 (30분 넘게 쉬었다 오면 새 방문)
  PRIMARY KEY (visitor_id, day)
);
CREATE INDEX IF NOT EXISTS idx_artinfo_visitor_daily_activity_day ON artinfo_visitor_daily_activity (day);
CREATE INDEX IF NOT EXISTS idx_artinfo_visitor_daily_activity_user ON artinfo_visitor_daily_activity (user_id, day);
