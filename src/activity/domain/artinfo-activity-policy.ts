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

/**
 * 한 IP 가 한 시간 안에 새로 만들 수 있는 방문자 수.
 * localStorage 가 매번 비어 있는 자동화 브라우저는 요청마다 새 방문자 ID 를 만들어 DAU 를 부풀린다 —
 * 같은 IP 에서 이 수를 넘는 새 방문자는 집계하지 않는다. (학교·사무실 NAT 는 한 시간에 10명을 잘 넘지 않는다)
 */
export const ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP = 10;
export const ARTINFO_ACTIVITY_NEW_VISITOR_WINDOW_SECONDS = 60 * 60;

/** 프록시가 넘겨준 X-Forwarded-For 의 첫 주소(실제 사용자). 없으면 null — IP 를 모르면 상한을 걸지 않는다 */
export function clientIp(forwardedFor: string | string[] | undefined | null): string | null {
  const raw = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  if (typeof raw !== 'string') return null;
  const first = raw.split(',')[0].trim();
  return first ? first.slice(0, 64) : null;
}

/** IP × 한 시간 버킷 키 — Redis SET 에 그 시간에 허용한 방문자 ID 를 담는다 */
export function newVisitorLimitKey(ip: string, nowMs: number): string {
  return `ACTIVITY:NEWVIS:${ip}:${Math.floor(nowMs / (ARTINFO_ACTIVITY_NEW_VISITOR_WINDOW_SECONDS * 1000))}`;
}

/**
 * 같은 User-Agent 문자열에서 10분 안에 새로 생길 수 있는 방문자 수 — **데스크톱 Linux UA 에만** 건다.
 * IP 를 바꿔 가며(프록시 풀) 페이지마다 새 프로필로 도는 크롤러는 IP 상한을 피하지만 UA 는 한 문자열로 고정돼 있다 —
 * 2026-11-12 'Linux · Chrome' 비회원 수십 명이 1분 안에 채용 상세를 한 페이지씩 보고 나간 사례.
 * 모든 UA 에 걸면 안 된다: 카카오 채널 발송 뒤 10분에 1,000명이 들어올 때 같은 iOS 버전의 Safari·카카오톡 인앱 UA 는
 * 수백 명이 완전히 같아서 실제 방문이 누락된다. 데스크톱 Linux 는 한국 실사용자 중 1% 미만이라 10분에 30명이 새로 올 일이 없다.
 * (학교 크롬북 'X11; CrOS' 는 제외 — 한 반이 동시에 들어올 수 있다)
 */
export const ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_UA = 30;
export const ARTINFO_ACTIVITY_NEW_VISITOR_UA_WINDOW_SECONDS = 10 * 60;

/** 데스크톱 Linux(X11) 브라우저 UA — 서버·헤드리스 환경의 크롤러가 주로 쓰는 플랫폼. 크롬북(CrOS)·Android 는 아니다 */
export function isDesktopLinuxUserAgent(userAgent: string | undefined | null): boolean {
  if (!userAgent) return false;
  return /X11;\s*(Linux|Ubuntu|Fedora|Debian)/i.test(userAgent) && !/CrOS|Android/i.test(userAgent);
}

/** UA × 10분 버킷 키 — UA 문자열은 길어서 짧은 해시로 줄인다 */
export function newVisitorUaLimitKey(userAgent: string, nowMs: number): string {
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) hash = (hash * 31 + userAgent.charCodeAt(i)) | 0;
  return `ACTIVITY:NEWVIS:UA:${(hash >>> 0).toString(16)}:${Math.floor(nowMs / (ARTINFO_ACTIVITY_NEW_VISITOR_UA_WINDOW_SECONDS * 1000))}`;
}
