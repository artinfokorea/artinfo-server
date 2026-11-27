// 영업 대상(교회 리드) 값 정리용 순수 함수.

export const LEAD_STATUSES = ['new', 'contacted', 'consulting', 'trial', 'joined', 'rejected'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** none: 홈페이지 없음, blog: 블로그·카페만, old: 오래된 홈페이지, has: 홈페이지 있음, unknown: 모름 */
export const HOMEPAGE_STATUSES = ['unknown', 'none', 'blog', 'old', 'has'] as const;
export type HomepageStatus = (typeof HOMEPAGE_STATUSES)[number];

export interface SalesLeadInput {
  name: string;
  denomination: string | null;
  region: string | null;
  address: string | null;
  pastor: string | null;
  phone: string | null;
  email: string | null;
  homepageStatus: HomepageStatus;
  homepageUrl: string | null;
  source: string | null;
  status: LeadStatus;
  emailConsent: boolean;
  memo: string | null;
}

const clean = (v: unknown, max: number): string | null => {
  if (v === undefined || v === null) return null;
  const s = String(v).replace(/\s+/g, ' ').trim();
  return s ? s.slice(0, max) : null;
};

/** 숫자만 남겨 02-123-4567 / 031-123-4567 / 010-1234-5678 꼴로. 숫자가 9자리 미만이면 원문 그대로. */
export function normalizePhone(raw: string | null | undefined): string | null {
  const s = clean(raw, 40);
  if (!s) return null;
  const d = s.replace(/\D/g, '');
  if (d.length < 9 || d.length > 11) return s;
  if (d.startsWith('02')) return d.length === 9 ? `02-${d.slice(2, 5)}-${d.slice(5)}` : `02-${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return s;
}

/** 소문자로. 이메일 꼴이 아니면 null. */
export function normalizeEmail(raw: string | null | undefined): string | null {
  const s =
    clean(raw, 200)
      ?.toLowerCase()
      .replace(/^mailto:/, '') ?? null;
  return s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}

/** 홈페이지 칸의 글자를 상태로. 주소가 있으면 블로그·카페는 blog, 그 밖은 has. */
export function parseHomepage(
  status: string | null | undefined,
  url: string | null | undefined,
): { homepageStatus: HomepageStatus; homepageUrl: string | null } {
  const u = clean(url, 300);
  const st = clean(status, 40)?.toLowerCase() ?? '';
  if ((HOMEPAGE_STATUSES as readonly string[]).includes(st)) return { homepageStatus: st as HomepageStatus, homepageUrl: u };
  if (/없|미보유|^(no|n|x)$/.test(st)) return { homepageStatus: 'none', homepageUrl: u };
  if (/블로그|카페|blog|cafe/.test(st)) return { homepageStatus: 'blog', homepageUrl: u };
  if (/오래|old/.test(st)) return { homepageStatus: 'old', homepageUrl: u };
  if (u) return { homepageStatus: /blog\.naver|cafe\.naver|cafe\.daum|tistory|band\.us/i.test(u) ? 'blog' : 'has', homepageUrl: u };
  if (/있|보유|^(yes|y|o)$/.test(st)) return { homepageStatus: 'has', homepageUrl: null };
  return { homepageStatus: 'unknown', homepageUrl: null };
}

export function toLeadInput(raw: Partial<Record<keyof SalesLeadInput, unknown>>): SalesLeadInput | null {
  const name = clean(raw.name, 120);
  if (!name) return null;
  const hp = parseHomepage(raw.homepageStatus as string, raw.homepageUrl as string);
  const status = clean(raw.status, 20) as LeadStatus | null;
  return {
    name,
    denomination: clean(raw.denomination, 80),
    region: clean(raw.region, 80),
    address: clean(raw.address, 300),
    pastor: clean(raw.pastor, 80),
    phone: normalizePhone(raw.phone as string),
    email: normalizeEmail(raw.email as string),
    ...hp,
    source: clean(raw.source, 120),
    status: status && (LEAD_STATUSES as readonly string[]).includes(status) ? status : 'new',
    emailConsent: raw.emailConsent === true,
    memo: clean(raw.memo, 2000),
  };
}

/** 같은 교회 판단: 이름이 같고 (전화가 같거나 주소가 같거나 둘 다 비었을 때). */
export function sameLead(a: Pick<SalesLeadInput, 'name' | 'phone' | 'address'>, b: Pick<SalesLeadInput, 'name' | 'phone' | 'address'>): boolean {
  if (a.name.replace(/\s/g, '') !== b.name.replace(/\s/g, '')) return false;
  const digits = (p: string | null) => (p ?? '').replace(/\D/g, '');
  if (digits(a.phone) && digits(a.phone) === digits(b.phone)) return true;
  if (a.address && b.address && a.address === b.address) return true;
  return !digits(a.phone) && !digits(b.phone) && !a.address && !b.address;
}
