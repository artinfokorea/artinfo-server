import { lunarToSolar } from '@/ongi/event/domain/service/ongi-event-occurrence';

export interface OngiHoliday {
  /** 양력 YYYY-MM-DD */
  date: string;
  name: string;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const dateStr = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;

function addDays(date: string, days: number): string {
  const t = new Date(`${date}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + days);
  return dateStr(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

/** 0=일 … 6=토 */
const dayOfWeek = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();
const isWeekend = (date: string) => dayOfWeek(date) === 0 || dayOfWeek(date) === 6;

/** 양력 고정 공휴일 — substitutable: 토·일요일과 겹치면 대체공휴일 (2023.5 확대 적용 기준) */
const FIXED: { month: number; day: number; name: string; substitutable: boolean }[] = [
  { month: 1, day: 1, name: '신정', substitutable: false },
  { month: 3, day: 1, name: '삼일절', substitutable: true },
  { month: 5, day: 5, name: '어린이날', substitutable: true },
  { month: 6, day: 6, name: '현충일', substitutable: false },
  { month: 8, day: 15, name: '광복절', substitutable: true },
  { month: 10, day: 3, name: '개천절', substitutable: true },
  { month: 10, day: 9, name: '한글날', substitutable: true },
  { month: 12, day: 25, name: '기독탄신일', substitutable: true },
];

/**
 * 해당 연도의 한국 공휴일 — 규칙 기반 계산.
 * 설·추석 연휴는 음력 변환으로, 대체공휴일은 관공서 공휴일 규정(설·추석은 일요일 겹침,
 * 나머지 대상 공휴일은 토·일 겹침 시 다음 첫 평일)으로 계산한다.
 * 선거일·임시공휴일은 규칙으로 알 수 없으므로 ongi_configs(extra_holidays)에서 보충한다.
 */
export function holidaysOf(year: number): OngiHoliday[] {
  const list: OngiHoliday[] = [];
  const taken = new Set<string>();
  const add = (date: string | null, name: string) => {
    if (!date) return;
    list.push({ date, name });
    taken.add(date);
  };

  for (const fixed of FIXED) add(dateStr(year, fixed.month, fixed.day), fixed.name);

  const seollal = lunarToSolar(year, 1, 1);
  if (seollal) {
    add(addDays(seollal, -1), '설날 연휴');
    add(seollal, '설날');
    add(addDays(seollal, 1), '설날 연휴');
  }
  const buddha = lunarToSolar(year, 4, 8);
  add(buddha, '부처님오신날');
  const chuseok = lunarToSolar(year, 8, 15);
  if (chuseok) {
    add(addDays(chuseok, -1), '추석 연휴');
    add(chuseok, '추석');
    add(addDays(chuseok, 1), '추석 연휴');
  }

  // ── 대체공휴일 ──
  const substitutes: OngiHoliday[] = [];
  const nextWorkday = (after: string) => {
    let candidate = addDays(after, 1);
    while (isWeekend(candidate) || taken.has(candidate) || substitutes.some(sub => sub.date === candidate)) candidate = addDays(candidate, 1);
    return candidate;
  };

  for (const fixed of FIXED) {
    if (!fixed.substitutable) continue;
    const date = dateStr(year, fixed.month, fixed.day);
    if (isWeekend(date)) substitutes.push({ date: nextWorkday(date), name: `대체공휴일(${fixed.name})` });
  }
  if (buddha && isWeekend(buddha)) substitutes.push({ date: nextWorkday(buddha), name: '대체공휴일(부처님오신날)' });
  // 설·추석은 연휴 사흘 중 하루라도 일요일과 겹치면 연휴 다음 첫 평일이 대체공휴일
  for (const [base, label] of [
    [seollal, '설날'],
    [chuseok, '추석'],
  ] as const) {
    if (!base) continue;
    const triple = [addDays(base, -1), base, addDays(base, 1)];
    if (triple.some(day => dayOfWeek(day) === 0)) substitutes.push({ date: nextWorkday(triple[2]), name: `대체공휴일(${label})` });
  }

  return [...list, ...substitutes].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
