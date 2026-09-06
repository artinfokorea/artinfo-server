import * as lunarModule from 'korean-lunar-calendar';
import type KoreanLunarCalendarType from 'korean-lunar-calendar';

// CJS(module.exports = class)와 ESM(default) 어느 쪽으로 로드돼도 클래스를 집는다 — esModuleInterop 미사용 환경 대비
const KoreanLunarCalendar =
  (lunarModule as { default?: typeof KoreanLunarCalendarType }).default ?? (lunarModule as unknown as typeof KoreanLunarCalendarType);

/** 발생일 계산에 필요한 일정 필드 — 엔티티/요청 어느 쪽에서든 만들 수 있게 분리 */
export interface OngiEventSchedule {
  /** 입력 날짜 (calendarType 기준) YYYY-MM-DD */
  eventDate: string;
  /** HH:MM — null 이면 하루 종일 */
  eventTime: string | null;
  calendarType: string;
  repeatType: string;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
export const toDateStr = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;
const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
};

/** KST 기준 오늘 날짜 — 서버 TZ 와 무관하게 계산 */
export function todayKst(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number): string {
  const { y, m, d } = parse(dateStr);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return toDateStr(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** b - a (일 단위) */
export function diffDays(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);
  return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / 86_400_000);
}

function isValidSolar(y: number, m: number, d: number): boolean {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** 음력 날짜 → 양력 (지원 범위 밖이거나 없는 날짜면 null) */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number): string | null {
  const cal = new KoreanLunarCalendar();
  if (!cal.setLunarDate(lunarYear, lunarMonth, lunarDay, false)) return null;
  const s = cal.getSolarCalendar();
  return toDateStr(s.year, s.month, s.day);
}

/** 양력 날짜의 음력 표기 — "음력 8월 1일" */
export function lunarLabelOf(solarDate: string): string | null {
  const { y, m, d } = parse(solarDate);
  const cal = new KoreanLunarCalendar();
  if (!cal.setSolarDate(y, m, d)) return null;
  const l = cal.getLunarCalendar();
  return `음력 ${l.month}월 ${l.day}일`;
}

/** 입력 날짜의 양력 기준일 — 음력이면 그 음력 연/월/일을 그대로 변환 */
export function baseSolarDate(s: OngiEventSchedule): string | null {
  if (s.calendarType !== 'lunar') return s.eventDate;
  const { y, m, d } = parse(s.eventDate);
  return lunarToSolar(y, m, d);
}

/**
 * [from, to] (포함) 범위의 발생일들 — 양력 날짜 문자열, 오름차순.
 * 매월 반복은 입력 일자 기준(양력), 매년 음력 반복은 해마다 음력→양력 변환.
 */
export function occurrencesInRange(s: OngiEventSchedule, from: string, to: string): string[] {
  const base = baseSolarDate(s);
  if (!base || from > to) return [];
  const out: string[] = [];
  const push = (d: string | null) => {
    if (d && d >= from && d <= to && d >= base) out.push(d);
  };

  const fromY = Number(from.slice(0, 4));
  const toY = Number(to.slice(0, 4));

  switch (s.repeatType) {
    case 'weekly': {
      if (base > to) break;
      let start = base;
      if (base < from) start = addDays(base, Math.ceil(diffDays(base, from) / 7) * 7);
      for (let d = start; d <= to; d = addDays(d, 7)) push(d);
      break;
    }
    case 'monthly': {
      const day = parse(s.eventDate).d;
      for (let y = fromY; y <= toY; y++) for (let m = 1; m <= 12; m++) if (isValidSolar(y, m, day)) push(toDateStr(y, m, day));
      break;
    }
    case 'yearly': {
      const { m, d } = parse(s.eventDate);
      for (let y = fromY - 1; y <= toY + 1; y++) {
        if (s.calendarType === 'lunar') push(lunarToSolar(y, m, d));
        else if (isValidSolar(y, m, d)) push(toDateStr(y, m, d));
      }
      break;
    }
    default:
      push(base);
  }

  return [...new Set(out)].sort();
}

/** 기준일(포함) 이후 첫 발생일 — 반복 없는 일정은 지났어도 원래 날짜 그대로 */
export function nextOccurrenceOnOrAfter(s: OngiEventSchedule, fromDate: string): string | null {
  const [first] = occurrencesInRange(s, fromDate, addDays(fromDate, 800));
  if (first) return first;
  return s.repeatType === 'none' ? baseSolarDate(s) : null;
}

/**
 * 발생일의 리마인드 시각(UTC Date) — 하루 전 오전 9시(KST) + 시간 지정 일정은 1시간 전.
 * 이미 지난 시각은 null — 등록 직후 잘못된 "내일" 알림이 나가지 않게.
 */
export function remindTimesFor(occurrence: string, eventTime: string | null, now: Date): { dayAt: Date | null; hourAt: Date | null } {
  const dayAt = new Date(`${addDays(occurrence, -1)}T09:00:00+09:00`);
  let hourAt: Date | null = null;
  if (eventTime) hourAt = new Date(new Date(`${occurrence}T${eventTime}:00+09:00`).getTime() - 3600_000);
  return { dayAt: dayAt > now ? dayAt : null, hourAt: hourAt && hourAt > now ? hourAt : null };
}

/** "19:30" → "오후 7:30" */
export function formatTimeKo(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour12}:${pad2(m)}`;
}
