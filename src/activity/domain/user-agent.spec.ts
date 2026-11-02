import { normalizeLandingPath, normalizeReferrerHost, parseUserAgent } from '@/activity/domain/user-agent';

describe('parseUserAgent', () => {
  it('맥 크롬 → 데스크톱 / macOS / Chrome', () => {
    expect(parseUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36')).toEqual({
      device: '데스크톱',
      os: 'macOS',
      browser: 'Chrome',
    });
  });

  it('아이폰 사파리 → 모바일 / iOS / Safari', () => {
    expect(
      parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'),
    ).toEqual({ device: '모바일', os: 'iOS', browser: 'Safari' });
  });

  it('안드로이드 카카오톡 내 브라우저 → 모바일 / Android / 카카오톡', () => {
    expect(
      parseUserAgent('Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 KAKAOTALK 10.8.0'),
    ).toEqual({ device: '모바일', os: 'Android', browser: '카카오톡' });
  });

  it('네이버 앱 → 네이버', () => {
    expect(
      parseUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 NAVER(inapp; search; 2000; 12.6.0)',
      ).browser,
    ).toBe('네이버');
  });

  it('삼성 인터넷, 웨일, 엣지, 파이어폭스', () => {
    expect(
      parseUserAgent('Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36')
        .browser,
    ).toBe('삼성 인터넷');
    expect(
      parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Whale/3.28.266.14 Safari/537.36'),
    ).toEqual({ device: '데스크톱', os: 'Windows', browser: '웨일' });
    expect(
      parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0').browser,
    ).toBe('Edge');
    expect(parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0').browser).toBe('Firefox');
  });

  it('아이패드 → 태블릿', () => {
    expect(
      parseUserAgent('Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1').device,
    ).toBe('태블릿');
  });

  it('없거나 모르는 값 → 기타', () => {
    expect(parseUserAgent(null)).toEqual({ device: '기타', os: '기타', browser: '기타' });
    expect(parseUserAgent('something')).toEqual({ device: '데스크톱', os: '기타', browser: '기타' });
  });
});

describe('normalizeReferrerHost', () => {
  it('외부 사이트는 도메인만 남긴다', () => {
    expect(normalizeReferrerHost('https://search.naver.com/search.naver?query=%EC%95%84%ED%8A%B8%EC%9D%B8%ED%8F%AC')).toBe('search.naver.com');
    expect(normalizeReferrerHost('https://www.google.com/')).toBe('www.google.com');
  });

  it('우리 사이트에서 온 것(내부 이동)이나 비어 있으면 null', () => {
    expect(normalizeReferrerHost('https://www.artinfokorea.com/jobs')).toBeNull();
    expect(normalizeReferrerHost('https://artinfokorea.com/')).toBeNull();
    expect(normalizeReferrerHost('')).toBeNull();
    expect(normalizeReferrerHost(undefined)).toBeNull();
    expect(normalizeReferrerHost('not a url')).toBeNull();
  });
});

describe('normalizeLandingPath', () => {
  it('경로만, 쿼리는 뺀다 (검색어 등 개인적인 값이 남지 않게)', () => {
    expect(normalizeLandingPath('/jobs/487')).toBe('/jobs/487');
    expect(normalizeLandingPath('/jobs?keyword=홍길동')).toBe('/jobs');
  });

  it('/ 로 시작하지 않거나 너무 길면 null / 200자로 자른다', () => {
    expect(normalizeLandingPath('jobs')).toBeNull();
    expect(normalizeLandingPath(undefined)).toBeNull();
    expect(normalizeLandingPath('/' + 'a'.repeat(300))).toHaveLength(200);
  });
});
