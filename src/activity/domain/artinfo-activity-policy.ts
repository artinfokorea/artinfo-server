/** 웹이 한 번에 보낼 수 있는 체류 시간 — 전송이 밀렸다 한꺼번에 와도 30분까지만 받는다 */
export const ARTINFO_ACTIVITY_MAX_PING_SECONDS = 30 * 60;

export function normalizeActiveSeconds(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(Math.round(raw), ARTINFO_ACTIVITY_MAX_PING_SECONDS);
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** 방문자 ID 는 브라우저가 crypto.randomUUID() 로 만든 UUID v4 만 받는다 */
export function isValidVisitorId(raw: unknown): raw is string {
  return typeof raw === 'string' && UUID_V4.test(raw);
}

/**
 * 검색 로봇·크롤러·자동화 도구 User-Agent. 브라우저 앱 내장(KAKAOTALK, NAVER inapp 등)은 사람으로 본다.
 * 웹(ActivityTracker)이 먼저 거르고, 서버가 한 번 더 거른다.
 */
const BOT_UA =
  /bot|crawl|spider|slurp|yeti|daum\/|bingpreview|facebookexternalhit|headless|phantomjs|puppeteer|playwright|lighthouse|python-requests|python-urllib|curl\/|wget|go-http-client|axios\/|node-fetch|java\/|okhttp|scrapy|httpclient/i;

export function isBotUserAgent(userAgent: string | undefined | null): boolean {
  if (!userAgent) return true;
  return BOT_UA.test(userAgent);
}

export function normalizePageViews(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(Math.floor(raw), 100);
}

/** 한 번의 전송에 담을 수 있는 경로 수 — 전송이 밀려 몰려와도 이만큼만 받는다 */
export const ARTINFO_ACTIVITY_MAX_PATHS_PER_PING = 100;
/** 방문자 × 날짜 행에 쌓아 두는 경로 수 상한 (앞에서부터 보존) */
export const ARTINFO_ACTIVITY_MAX_PATHS_PER_DAY = 200;

/** 지난 전송 이후 본 경로 목록 — 순서를 지키고, 쿼리·해시를 떼고, / 로 시작하지 않는 것은 버린다 */
export function normalizePaths(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const paths: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string' || !item.startsWith('/')) continue;
    paths.push(item.split('?')[0].split('#')[0].slice(0, 200));
    if (paths.length >= ARTINFO_ACTIVITY_MAX_PATHS_PER_PING) break;
  }
  return paths;
}

/** 참여한 방문으로 셀 기준 — GA4 의 참여 세션과 같다: 10초 이상 머물렀거나 2페이지 이상 */
export const ENGAGED_MIN_SECONDS = 10;
export const ENGAGED_MIN_PAGE_VIEWS = 2;

/** 지표 쿼리에서 쓰는 조건 (artinfo_visitor_daily_activity 의 한 행 = 방문자 × 날짜) */
export const ENGAGED_VISITOR_SQL = `(active_seconds >= ${ENGAGED_MIN_SECONDS} OR page_views >= ${ENGAGED_MIN_PAGE_VIEWS})`;
