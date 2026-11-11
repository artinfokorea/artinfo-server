/**
 * 문의 폼 스팸 판정 — 외부 키 없이 막을 수 있는 것부터.
 * 1) 허니팟: 사람 눈에는 안 보이는 website 칸을 채우면 봇
 * 2) 너무 빠른 제출: 폼을 연 지 3초 안에 보내면 봇 (startedAt 을 보낸 클라이언트만 검사)
 * 3) 기계가 만든 글자열: 한글·공백 없이 영문자만 12자 이상 이어진 제목/내용 (yKhpAeIThWuyPraCaAUSV 같은 것)
 * 4) 제목과 내용이 같음
 * 스팸이면 저장하지 않고 성공처럼 응답한다 (봇이 걸러진 걸 눈치채지 못하게).
 */
export interface InquirySpamInput {
  title: string;
  contents: string;
  email: string;
  /** 허니팟 — 사람은 비워 둔다 */
  website?: string | null;
  /** 폼을 연 시각 (epoch ms) */
  startedAt?: number | null;
  now?: number;
}

export const MIN_SUBMIT_MS = 3000;
const RANDOM_LETTERS = /^[A-Za-z]{12,}$/;

export function detectInquirySpam(input: InquirySpamInput): string | null {
  if (input.website && input.website.trim()) return 'honeypot';
  const now = input.now ?? Date.now();
  if (typeof input.startedAt === 'number' && input.startedAt > 0 && now - input.startedAt < MIN_SUBMIT_MS) return 'too-fast';
  const title = input.title.trim();
  const contents = input.contents.trim();
  if (RANDOM_LETTERS.test(title)) return 'random-title';
  if (RANDOM_LETTERS.test(contents)) return 'random-contents';
  if (title.length >= 12 && title === contents) return 'title-equals-contents';
  return null;
}

/** 같은 IP·이메일에서 짧은 시간에 반복 제출을 막는다 (인스턴스별 메모리) */
export class InquiryRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly rules: { ipPerHour: number; emailPerDay: number } = { ipPerHour: 5, emailPerDay: 3 },
    private readonly now: () => number = () => Date.now(),
  ) {}

  /** 허용되면 true 를 돌려주고 기록한다 */
  allow(ip: string | null | undefined, email: string): boolean {
    const t = this.now();
    const ipOk = !ip || this.count(`ip:${ip}`, t, 60 * 60 * 1000) < this.rules.ipPerHour;
    const emailOk = this.count(`email:${email.toLowerCase()}`, t, 24 * 60 * 60 * 1000) < this.rules.emailPerDay;
    if (!ipOk || !emailOk) return false;
    if (ip) this.record(`ip:${ip}`, t);
    this.record(`email:${email.toLowerCase()}`, t);
    return true;
  }

  private count(key: string, now: number, windowMs: number): number {
    const kept = (this.hits.get(key) ?? []).filter(at => now - at < windowMs);
    this.hits.set(key, kept);
    return kept.length;
  }

  private record(key: string, now: number) {
    this.hits.set(key, [...(this.hits.get(key) ?? []), now]);
  }
}
