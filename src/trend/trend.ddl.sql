-- synchronize:false 이므로 운영 DB에 직접 실행해야 합니다.

-- AI 요약 생성 이력 (결산·키워드 히스토리용 영구 보관)
CREATE TABLE IF NOT EXISTS trend_summaries (
  id           SERIAL PRIMARY KEY,
  keyword      VARCHAR(100) NOT NULL,
  region       VARCHAR(8)   NOT NULL,
  headline     VARCHAR      NOT NULL,
  summary      TEXT         NOT NULL,
  bullets      JSONB        NOT NULL DEFAULT '[]',
  people       JSONB        NOT NULL DEFAULT '[]',
  articles     JSONB        NOT NULL DEFAULT '[]',
  model        VARCHAR(64)  NOT NULL,
  generated_at TIMESTAMPTZ  NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trend_summaries_keyword_generated ON trend_summaries (keyword, generated_at);

-- 일자별 키워드 순위 결산 (매일 00:10 KST 롤업, Redis 누적분을 확정 저장)
CREATE TABLE IF NOT EXISTS trend_daily_keywords (
  id         SERIAL PRIMARY KEY,
  date       DATE         NOT NULL,
  keyword    VARCHAR(100) NOT NULL,
  peak       SMALLINT     NOT NULL,
  peak_at    TIMESTAMPTZ  NOT NULL,
  first_seen TIMESTAMPTZ  NOT NULL,
  last_seen  TIMESTAMPTZ  NOT NULL,
  samples    INTEGER      NOT NULL,
  score      INTEGER      NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_trend_daily_keywords_date_keyword ON trend_daily_keywords (date, keyword);
CREATE INDEX IF NOT EXISTS idx_trend_daily_keywords_keyword ON trend_daily_keywords (keyword);

-- 일자·시각대별 1위
CREATE TABLE IF NOT EXISTS trend_daily_hourly_tops (
  date    DATE         NOT NULL,
  hour    SMALLINT     NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  PRIMARY KEY (date, hour)
);
