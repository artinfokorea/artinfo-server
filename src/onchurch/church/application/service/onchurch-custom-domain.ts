// 교회 자체 도메인(custom_domain) 값 정규화·검증.
// 저장 시점에 한 번만 정리해서 DB에는 항상 소문자 호스트명만 들어가게 한다
// (미들웨어가 요청 Host 헤더와 문자열 비교로 매칭하므로 표기가 흔들리면 안 된다).

// 우리 서비스 도메인은 자체 도메인으로 등록할 수 없다 — 서브도메인 라우팅과 충돌한다.
const RESERVED_ROOTS = ['everychurch.co.kr', 'onchurch.kr', 'vercel.app', 'localhost'];

// 한글 도메인(예: 은석교회.한국)은 punycode('xn--...')로 변환해서 입력해야 한다 — 그 형태는 아래 패턴을 통과한다.
const HOSTNAME_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,}|xn--[a-z0-9-]{2,})$/;

export class OnchurchCustomDomainError extends Error {}

/**
 * 사용자가 입력한 값에서 호스트명만 뽑아 정규화한다.
 * 'https://WWW.Example.com/home' → 'www.example.com'
 * 빈 값이면 null(연결 해제).
 */
export function normalizeCustomDomain(input: string | null | undefined): string | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;

  // 브라우저 주소창에서 통째로 복사해 붙이는 경우가 많아 스킴·경로·포트를 털어낸다.
  const host = raw
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0]
    .split(':')[0]
    .replace(/\.$/, '')
    .trim();

  if (!host) return null;

  if (!HOSTNAME_PATTERN.test(host)) {
    throw new OnchurchCustomDomainError('올바른 도메인 주소가 아닙니다. (예: example.com, www.example.com)');
  }

  if (RESERVED_ROOTS.some(root => host === root || host.endsWith(`.${root}`))) {
    throw new OnchurchCustomDomainError('온교회 서비스 도메인은 자체 도메인으로 등록할 수 없습니다.');
  }

  return host;
}

/**
 * 대표 호스트의 반대쪽(www ↔ apex). 이 주소로 들어오면 대표 호스트로 308 리다이렉트한다.
 * 'www.a.com' → 'a.com', 'a.co.kr' → 'www.a.co.kr'
 *
 * 라벨 개수로 apex 여부를 판단하지 않는다 — 국내 교회는 'a.co.kr' 처럼 라벨이 3개인 apex가 흔해서
 * 그 방식이면 www 짝을 못 만든다. 짝이 DNS에 없으면 애초에 요청이 오지 않으므로 항상 만들어도 무해하다.
 */
export function counterpartHost(host: string): string {
  return host.startsWith('www.') ? host.slice(4) : `www.${host}`;
}
