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
  page_views     INTEGER NOT NULL DEFAULT 0,         -- 본 페이지 수
  PRIMARY KEY (visitor_id, day)
);
-- 2026-11-02 추가: 참여 기준(10초 이상 또는 2페이지 이상)용 페이지 수
ALTER TABLE artinfo_visitor_daily_activity ADD COLUMN IF NOT EXISTS page_views INTEGER NOT NULL DEFAULT 0;
-- 2026-11-02 추가: 관리자 방문자 목록용 (IP 는 저장하지 않는다)
ALTER TABLE artinfo_visitor_daily_activity ADD COLUMN IF NOT EXISTS user_agent VARCHAR(300);    -- 그날 마지막 User-Agent
ALTER TABLE artinfo_visitor_daily_activity ADD COLUMN IF NOT EXISTS referrer_host VARCHAR(255); -- 그날 처음 들어온 외부 사이트 도메인
ALTER TABLE artinfo_visitor_daily_activity ADD COLUMN IF NOT EXISTS landing_path VARCHAR(200);  -- 그날 처음 본 페이지 경로 (쿼리 제외)
-- 2026-11-03 추가: 이탈 페이지 — 그날 마지막 전송 시점에 보고 있던 페이지 경로
ALTER TABLE artinfo_visitor_daily_activity ADD COLUMN IF NOT EXISTS exit_path VARCHAR(200);
-- 2026-11-03 추가: 그날 거친 경로 목록 (순서대로, 최대 200개) — 관리자 방문자 목록에서 동선 확인용
ALTER TABLE artinfo_visitor_daily_activity ADD COLUMN IF NOT EXISTS paths JSONB NOT NULL DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS idx_artinfo_visitor_daily_activity_day ON artinfo_visitor_daily_activity (day);
CREATE INDEX IF NOT EXISTS idx_artinfo_visitor_daily_activity_user ON artinfo_visitor_daily_activity (user_id, day);
