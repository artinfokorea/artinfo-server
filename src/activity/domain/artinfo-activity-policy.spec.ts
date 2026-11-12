import {
  ENGAGED_MIN_PAGE_VIEWS,
  ENGAGED_MIN_SECONDS,
  ENGAGED_VISITOR_SQL,
  isBotUserAgent,
  isValidVisitorId,
  normalizeActiveSeconds,
  normalizePageViews,
  normalizePaths,
  ARTINFO_ACTIVITY_MAX_PATHS_PER_PING,
  ARTINFO_ACTIVITY_MAX_PING_SECONDS,
  ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP,
  ARTINFO_ACTIVITY_NEW_VISITOR_WINDOW_SECONDS,
  clientIp,
  newVisitorLimitKey,
} from '@/activity/domain/artinfo-activity-policy';

describe('normalizeActiveSeconds', () => {
  it('양의 정수는 그대로', () => {
    expect(normalizeActiveSeconds(60)).toBe(60);
  });

  it('소수는 반올림', () => {
    expect(normalizeActiveSeconds(59.6)).toBe(60);
  });

  it('한 번에 30분(1800초)까지만 받는다', () => {
    expect(ARTINFO_ACTIVITY_MAX_PING_SECONDS).toBe(1800);
    expect(normalizeActiveSeconds(99999)).toBe(1800);
  });

  it('0·음수·숫자가 아닌 값은 0', () => {
    expect(normalizeActiveSeconds(0)).toBe(0);
    expect(normalizeActiveSeconds(-5)).toBe(0);
    expect(normalizeActiveSeconds('60')).toBe(0);
    expect(normalizeActiveSeconds(undefined)).toBe(0);
    expect(normalizeActiveSeconds(Number.NaN)).toBe(0);
    expect(normalizeActiveSeconds(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('isValidVisitorId', () => {
  it('브라우저가 만든 UUID(v4) 는 통과', () => {
    expect(isValidVisitorId('3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b')).toBe(true);
    expect(isValidVisitorId('3F2B8C1E-9A4D-4E6F-8B2A-1C3D5E7F9A0B')).toBe(true);
  });

  it('형식이 다르면 거부 (임의 문자열로 행을 늘리지 못하게)', () => {
    expect(isValidVisitorId('hello')).toBe(false);
    expect(isValidVisitorId('3f2b8c1e-9a4d-1e6f-8b2a-1c3d5e7f9a0b')).toBe(false); // v1
    expect(isValidVisitorId('3f2b8c1e9a4d4e6f8b2a1c3d5e7f9a0b')).toBe(false);
    expect(isValidVisitorId(undefined)).toBe(false);
    expect(isValidVisitorId(123)).toBe(false);
  });
});

describe('isBotUserAgent', () => {
  it('검색 로봇·크롤러·헤드리스 브라우저는 로봇', () => {
    const bots = [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1) Chrome/130.0 Safari/537.36',
      'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)',
      'Mozilla/5.0 (compatible; Daum/4.1; +http://cs.daum.net/faq/15/4118.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0 Safari/537.36',
      'facebookexternalhit/1.1',
      'Slackbot-LinkExpanding 1.0',
      'python-requests/2.31.0',
      'curl/8.4.0',
      'Mozilla/5.0 (compatible; AhrefsBot/7.0)',
      'Mozilla/5.0 (compatible; GPTBot/1.0)',
    ];
    bots.forEach(ua => expect(isBotUserAgent(ua)).toBe(true));
  });

  it('일반 브라우저는 사람', () => {
    const humans = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 KAKAOTALK 10.8.0',
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0 Mobile Safari/537.36 NAVER(inapp; search; 2000; 12.6.0)',
    ];
    humans.forEach(ua => expect(isBotUserAgent(ua)).toBe(false));
  });

  it('User-Agent 가 없으면 로봇으로 본다', () => {
    expect(isBotUserAgent(undefined)).toBe(true);
    expect(isBotUserAgent('')).toBe(true);
  });
});

describe('normalizePageViews', () => {
  it('0 이상 정수, 한 번에 최대 100', () => {
    expect(normalizePageViews(2)).toBe(2);
    expect(normalizePageViews(2.4)).toBe(2);
    expect(normalizePageViews(500)).toBe(100);
  });

  it('음수·숫자가 아닌 값은 0', () => {
    expect(normalizePageViews(-1)).toBe(0);
    expect(normalizePageViews('3')).toBe(0);
    expect(normalizePageViews(undefined)).toBe(0);
  });
});

describe('ENGAGED_VISITOR_SQL', () => {
  it('참여 기준: 10초 이상 머물렀거나 2페이지 이상 (GA4 참여 기준과 같음)', () => {
    expect(ENGAGED_MIN_SECONDS).toBe(10);
    expect(ENGAGED_MIN_PAGE_VIEWS).toBe(2);
    expect(ENGAGED_VISITOR_SQL).toBe('(active_seconds >= 10 OR page_views >= 2)');
  });
});

describe('normalizePaths', () => {
  it('경로 목록은 순서를 지키고 쿼리·해시를 뗀다', () => {
    expect(normalizePaths(['/', '/jobs?page=2', '/jobs/487#top'])).toEqual(['/', '/jobs', '/jobs/487']);
  });

  it('/ 로 시작하지 않거나 문자열이 아닌 항목은 버린다', () => {
    expect(normalizePaths(['https://evil.example/x', 3, null, '/lessons'])).toEqual(['/lessons']);
  });

  it('배열이 아니면 빈 목록', () => {
    expect(normalizePaths(undefined)).toEqual([]);
    expect(normalizePaths('/jobs')).toEqual([]);
  });

  it('한 번에 100개까지만 받는다', () => {
    expect(ARTINFO_ACTIVITY_MAX_PATHS_PER_PING).toBe(100);
    expect(normalizePaths(Array.from({ length: 150 }, (_, i) => `/p/${i}`))).toHaveLength(100);
  });
});

describe('clientIp', () => {
  it('X-Forwarded-For 의 첫 주소(실제 사용자)를 쓴다', () => {
    expect(clientIp('203.0.113.7, 10.0.0.2')).toBe('203.0.113.7');
    expect(clientIp(' 203.0.113.7 ')).toBe('203.0.113.7');
    expect(clientIp(['198.51.100.9', '10.0.0.2'])).toBe('198.51.100.9');
  });

  it('헤더가 없거나 비어 있으면 null — 프록시가 안 넘겨주면 상한을 걸지 않는다', () => {
    expect(clientIp(undefined)).toBeNull();
    expect(clientIp('')).toBeNull();
    expect(clientIp(' , 10.0.0.2')).toBeNull();
    expect(clientIp([])).toBeNull();
  });

  it('비정상적으로 긴 값은 64자까지만', () => {
    expect(clientIp('a'.repeat(100))).toBe('a'.repeat(64));
  });
});

describe('newVisitorLimitKey', () => {
  it('IP 와 한 시간 단위 버킷으로 키를 만든다', () => {
    const t = Date.UTC(2026, 10, 4, 9, 31, 0); // 09:31 UTC
    expect(newVisitorLimitKey('203.0.113.7', t)).toBe(`ACTIVITY:NEWVIS:203.0.113.7:${Math.floor(t / 3_600_000)}`);
    expect(newVisitorLimitKey('203.0.113.7', t + 28 * 60_000)).toBe(newVisitorLimitKey('203.0.113.7', t));
    expect(newVisitorLimitKey('203.0.113.7', t + 29 * 60_000)).not.toBe(newVisitorLimitKey('203.0.113.7', t));
  });

  it('한 IP 가 한 시간에 만들 수 있는 새 방문자는 10명', () => {
    expect(ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP).toBe(10);
    expect(ARTINFO_ACTIVITY_NEW_VISITOR_WINDOW_SECONDS).toBe(3600);
  });
});

describe('isDesktopLinuxUserAgent', () => {
  const { isDesktopLinuxUserAgent } = jest.requireActual('@/activity/domain/artinfo-activity-policy');
  it('X11 Linux/Ubuntu 데스크톱 브라우저만 참', () => {
    expect(isDesktopLinuxUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/142.0.0.0 Safari/537.36')).toBe(true);
    expect(isDesktopLinuxUserAgent('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0')).toBe(true);
  });
  it('크롬북·Android·Windows·Mac·iPhone·빈 값은 거짓', () => {
    expect(isDesktopLinuxUserAgent('Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) Chrome/142.0.0.0')).toBe(false);
    expect(isDesktopLinuxUserAgent('Mozilla/5.0 (Linux; Android 14; SM-S928N) Chrome/142.0.0.0 Mobile')).toBe(false);
    expect(isDesktopLinuxUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/142.0.0.0')).toBe(false);
    expect(isDesktopLinuxUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15')).toBe(false);
    expect(isDesktopLinuxUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) Safari/604.1')).toBe(false);
    expect(isDesktopLinuxUserAgent(undefined)).toBe(false);
  });
});
