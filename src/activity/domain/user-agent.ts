export interface ParsedUserAgent {
  device: '모바일' | '태블릿' | '데스크톱' | '기타';
  os: string;
  browser: string;
}

/** 관리자 방문자 목록용 간단한 User-Agent 해석 (정밀 분석이 아니라 한눈에 보는 용도) */
export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua) return { device: '기타', os: '기타', browser: '기타' };

  const device: ParsedUserAgent['device'] = /iPad|Tablet/i.test(ua) ? '태블릿' : /Mobi|iPhone|Android/i.test(ua) ? '모바일' : '데스크톱';

  const os = /iPhone|iPad|iPod/i.test(ua)
    ? 'iOS'
    : /Android/i.test(ua)
      ? 'Android'
      : /Windows/i.test(ua)
        ? 'Windows'
        : /Mac OS X|Macintosh/i.test(ua)
          ? 'macOS'
          : /Linux/i.test(ua)
            ? 'Linux'
            : '기타';

  // 앱 내 브라우저와 파생 브라우저를 먼저 본다 (대부분 Chrome/Safari 문자열을 함께 담고 있다)
  const browser = /KAKAOTALK/i.test(ua)
    ? '카카오톡'
    : /NAVER\(inapp/i.test(ua)
      ? '네이버'
      : /Instagram/i.test(ua)
        ? '인스타그램'
        : /FBAN|FBAV/i.test(ua)
          ? '페이스북'
          : /SamsungBrowser/i.test(ua)
            ? '삼성 인터넷'
            : /Whale/i.test(ua)
              ? '웨일'
              : /Edg\//i.test(ua)
                ? 'Edge'
                : /Firefox|FxiOS/i.test(ua)
                  ? 'Firefox'
                  : /Chrome|CriOS/i.test(ua)
                    ? 'Chrome'
                    : /Safari/i.test(ua)
                      ? 'Safari'
                      : '기타';

  return { device, os, browser };
}

const OWN_HOST = /(^|\.)artinfokorea\.com$/i;

/** 유입 경로는 외부 사이트의 도메인만 남긴다 (검색어 등 쿼리는 버린다). 내부 이동·없음은 null */
export function normalizeReferrerHost(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (!host || OWN_HOST.test(host)) return null;
    return host.slice(0, 255);
  } catch {
    return null;
  }
}

/** 첫 페이지 경로 — 쿼리 없이 200자까지 */
export function normalizeLandingPath(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return null;
  return raw.split('?')[0].split('#')[0].slice(0, 200);
}
