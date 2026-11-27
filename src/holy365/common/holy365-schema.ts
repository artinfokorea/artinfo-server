/**
 * 홀리365 테이블 DDL — 전부 멱등(IF NOT EXISTS / ON CONFLICT).
 * 서버 기동 시 Holy365SchemaBootstrapService 가, 성경 가져오기 스크립트가 시작할 때 한 번 더 실행한다.
 * synchronize:false 환경이라 이 목록이 스키마의 원본이다 — 컬럼을 바꿀 땐 ALTER ... IF NOT EXISTS 를 뒤에 덧붙일 것.
 */
export const HOLY365_SCHEMA_STATEMENTS: string[] = [
  // 계정 — 소셜 로그인만 (sns_type = google | kakao | naver, 로컬 개발 로그인은 dev)
  `CREATE TABLE IF NOT EXISTS holy365_users (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(30) NOT NULL,
    email          VARCHAR(254),
    sns_type       VARCHAR(16) NOT NULL,
    sns_id         VARCHAR(255) NOT NULL,
    icon_image_url VARCHAR,
    locale         VARCHAR(8) NOT NULL DEFAULT 'ko',
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS uidx_holy365_users_sns ON holy365_users (sns_type, sns_id)`,
  // 로그인 세션
  `CREATE TABLE IF NOT EXISTS holy365_auths (
    id                       SERIAL PRIMARY KEY,
    user_id                  INTEGER NOT NULL,
    access_token             VARCHAR NOT NULL,
    access_token_expires_in  TIMESTAMP NOT NULL,
    refresh_token            VARCHAR NOT NULL,
    refresh_token_expires_in TIMESTAMP NOT NULL,
    created_at               TIMESTAMP NOT NULL DEFAULT now(),
    updated_at               TIMESTAMP NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_holy365_auths_user ON holy365_auths (user_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS uidx_holy365_auths_refresh ON holy365_auths (refresh_token)`,
  // 번역본 — 본문이 들어온 번역본만 목록에 나온다
  `CREATE TABLE IF NOT EXISTS holy365_bible_versions (
    code       VARCHAR(16) PRIMARY KEY,
    name       VARCHAR(60) NOT NULL,
    language   VARCHAR(8) NOT NULL,
    copyright  VARCHAR(500) NOT NULL DEFAULT '',
    sort       INTEGER NOT NULL DEFAULT 0,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  `INSERT INTO holy365_bible_versions (code, name, language, copyright, sort) VALUES
    ('NKRV', '개역개정', 'ko', '성경전서 개역개정판 © 대한성서공회', 1),
    ('KJV', 'King James Version', 'en', 'Public Domain', 2)
   ON CONFLICT (code) DO NOTHING`,
  `CREATE TABLE IF NOT EXISTS holy365_verses (
    version_code VARCHAR(16) NOT NULL,
    book         SMALLINT NOT NULL,
    chapter      SMALLINT NOT NULL,
    verse        SMALLINT NOT NULL,
    text         TEXT NOT NULL,
    PRIMARY KEY (version_code, book, chapter, verse)
  )`,
  // 장별 절 수 — 가져오기 스크립트가 holy365_verses 에서 다시 만든다
  `CREATE TABLE IF NOT EXISTS holy365_chapters (
    version_code VARCHAR(16) NOT NULL,
    book         SMALLINT NOT NULL,
    chapter      SMALLINT NOT NULL,
    verse_count  SMALLINT NOT NULL,
    char_count   INTEGER NOT NULL,
    PRIMARY KEY (version_code, book, chapter)
  )`,
  // 절마다 몇 번 필사했는지 — 완주 횟수(장·권·전체)는 여기서 계산한다
  `CREATE TABLE IF NOT EXISTS holy365_verse_counts (
    user_id      INTEGER NOT NULL,
    version_code VARCHAR(16) NOT NULL,
    book         SMALLINT NOT NULL,
    chapter      SMALLINT NOT NULL,
    verse        SMALLINT NOT NULL,
    count        INTEGER NOT NULL DEFAULT 0,
    first_at     TIMESTAMP NOT NULL DEFAULT now(),
    last_at      TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, version_code, book, chapter, verse)
  )`,
  // 번역본별 마지막 필사 위치 (이어 쓰기)
  `CREATE TABLE IF NOT EXISTS holy365_user_versions (
    user_id      INTEGER NOT NULL,
    version_code VARCHAR(16) NOT NULL,
    last_book    SMALLINT NOT NULL,
    last_chapter SMALLINT NOT NULL,
    last_verse   SMALLINT NOT NULL,
    updated_at   TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, version_code)
  )`,
  // 하루 필사량 (한국 시간 기준 날짜)
  `CREATE TABLE IF NOT EXISTS holy365_daily_activity (
    user_id INTEGER NOT NULL,
    day     DATE NOT NULL,
    verses  INTEGER NOT NULL DEFAULT 0,
    chars   INTEGER NOT NULL DEFAULT 0,
    seconds INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day)
  )`,
  // 랭킹 · 통계 (2026-11-27) — 기간별 합계와 최근 7일 인기 장 조회용
  `CREATE INDEX IF NOT EXISTS idx_holy365_daily_activity_day ON holy365_daily_activity (day)`,
  `CREATE INDEX IF NOT EXISTS idx_holy365_verse_counts_last_at ON holy365_verse_counts (last_at)`,
  // 교회 (2026-11-27) — 카카오 장소면 place_id 로, 직접 등록이면 정리한 이름+지역(church_key)으로 같은 교회를 판단한다
  `CREATE TABLE IF NOT EXISTS holy365_churches (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(80) NOT NULL,
    region         VARCHAR(80) NOT NULL DEFAULT '',
    address        VARCHAR(200),
    church_key     VARCHAR(200) NOT NULL,
    kakao_place_id VARCHAR(32),
    created_by     INTEGER,
    created_at     TIMESTAMP NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS uidx_holy365_churches_kakao ON holy365_churches (kakao_place_id) WHERE kakao_place_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_holy365_churches_key ON holy365_churches (church_key)`,
  // 프로필 — 교회, 진행 상황 공개 여부. 엔티티가 매핑하므로 기동 시 먼저 만든다
  `ALTER TABLE holy365_users ADD COLUMN IF NOT EXISTS church_id INTEGER`,
  `ALTER TABLE holy365_users ADD COLUMN IF NOT EXISTS profile_public BOOLEAN NOT NULL DEFAULT true`,
  `CREATE INDEX IF NOT EXISTS idx_holy365_users_church ON holy365_users (church_id)`,
  // 팔로우
  `CREATE TABLE IF NOT EXISTS holy365_follows (
    follower_id  INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_holy365_follows_following ON holy365_follows (following_id)`,
  // 피드 (2026-11-27) — 글 · 사진(1:1 또는 4:5, 최대 10장) · 성경 구절. like/comment_count 는 비정규화 카운터
  `CREATE TABLE IF NOT EXISTS holy365_posts (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    content       TEXT NOT NULL DEFAULT '',
    aspect        VARCHAR(8) NOT NULL DEFAULT '1:1',
    images        JSONB NOT NULL DEFAULT '[]',
    verse         JSONB,
    like_count    INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_holy365_posts_user ON holy365_posts (user_id, id DESC)`,
  `CREATE TABLE IF NOT EXISTS holy365_post_likes (
    post_id    INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS holy365_post_comments (
    id         SERIAL PRIMARY KEY,
    post_id    INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    content    VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_holy365_post_comments_post ON holy365_post_comments (post_id, id)`,
  // 신고 — 운영자가 확인한다 (status open/resolved)
  `CREATE TABLE IF NOT EXISTS holy365_reports (
    id               SERIAL PRIMARY KEY,
    reporter_user_id INTEGER NOT NULL,
    target_type      VARCHAR(16) NOT NULL,
    target_id        INTEGER NOT NULL,
    reason           VARCHAR(500) NOT NULL,
    status           VARCHAR(16) NOT NULL DEFAULT 'open',
    created_at       TIMESTAMP NOT NULL DEFAULT now()
  )`,
];
