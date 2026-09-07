import { holidaysOf } from './ongi-holiday';

/**
 * 기대값은 실제 달력(정부 발표)에서 사람이 옮겨 적은 하드코딩 값이다.
 * 구현이 바뀌어 이 테스트가 깨지면 테스트가 아니라 구현을 의심할 것 — 기대값 수정은 사유와 함께 별도 커밋으로만.
 */
const has = (year: number, date: string, name: string) => holidaysOf(year).some(h => h.date === date && h.name === name);
const none = (year: number, date: string) => holidaysOf(year).every(h => h.date !== date);

describe('holidaysOf', () => {
  it('2026년 — 설날·대체공휴일이 실제 달력과 일치한다', () => {
    expect(has(2026, '2026-01-01', '신정')).toBe(true);
    expect(has(2026, '2026-02-16', '설날 연휴')).toBe(true);
    expect(has(2026, '2026-02-17', '설날')).toBe(true);
    expect(has(2026, '2026-02-18', '설날 연휴')).toBe(true);
    expect(has(2026, '2026-03-01', '삼일절')).toBe(true);
    expect(has(2026, '2026-03-02', '대체공휴일(삼일절)')).toBe(true); // 삼일절이 일요일
    expect(has(2026, '2026-05-24', '부처님오신날')).toBe(true);
    expect(has(2026, '2026-05-25', '대체공휴일(부처님오신날)')).toBe(true); // 일요일
    expect(has(2026, '2026-08-17', '대체공휴일(광복절)')).toBe(true); // 광복절이 토요일 → 일요일 건너뛰고 월요일
    expect(has(2026, '2026-09-25', '추석')).toBe(true);
    expect(none(2026, '2026-09-27')).toBe(true); // 추석 연휴(목~토)에 일요일이 없어 대체 없음
    expect(has(2026, '2026-10-05', '대체공휴일(개천절)')).toBe(true); // 토요일
    expect(none(2026, '2026-10-12')).toBe(true); // 한글날은 금요일 — 대체 없음
  });

  it('2025년 — 어린이날·부처님오신날 겹침과 추석 일요일 대체를 계산한다', () => {
    expect(has(2025, '2025-01-29', '설날')).toBe(true);
    expect(has(2025, '2025-01-28', '설날 연휴')).toBe(true);
    expect(has(2025, '2025-01-30', '설날 연휴')).toBe(true);
    expect(has(2025, '2025-03-03', '대체공휴일(삼일절)')).toBe(true); // 삼일절이 토요일
    expect(has(2025, '2025-05-05', '어린이날')).toBe(true);
    expect(has(2025, '2025-05-05', '부처님오신날')).toBe(true); // 같은 날 겹침
    expect(has(2025, '2025-05-06', '대체공휴일(어린이날)')).toBe(true); // 겹침 → 대체
    expect(has(2025, '2025-10-06', '추석')).toBe(true);
    expect(has(2025, '2025-10-08', '대체공휴일(추석)')).toBe(true); // 연휴 첫날(10/5)이 일요일
    expect(none(2025, '2025-10-04')).toBe(true); // 개천절(금) 대체 없음 — 10/4는 공휴일 아님
  });

  it('2024년 — 설날 연휴 일요일 겹침과 어린이날 일요일 대체', () => {
    expect(has(2024, '2024-02-10', '설날')).toBe(true);
    expect(has(2024, '2024-02-12', '대체공휴일(설날)')).toBe(true); // 연휴 마지막 날(2/11)이 일요일
    expect(has(2024, '2024-05-06', '대체공휴일(어린이날)')).toBe(true); // 어린이날이 일요일
  });

  it('불변식 — 대체공휴일은 평일이고, 목록은 날짜순이며, 같은 이름이 하루에 중복되지 않는다', () => {
    for (let year = 2024; year <= 2030; year += 1) {
      const holidays = holidaysOf(year);
      for (const holiday of holidays) {
        if (holiday.name.startsWith('대체공휴일')) {
          const day = new Date(`${holiday.date}T00:00:00Z`).getUTCDay();
          expect(day).toBeGreaterThan(0);
          expect(day).toBeLessThan(6);
        }
      }
      const sorted = [...holidays].sort((a, b) => (a.date < b.date ? -1 : 1));
      expect(holidays.map(h => h.date)).toEqual(sorted.map(h => h.date));
      const keys = holidays.map(h => `${h.date}|${h.name}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});
