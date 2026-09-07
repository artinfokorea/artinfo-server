import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { holidaysOf, OngiHoliday } from '@/ongi/event/domain/service/ongi-holiday';

const CACHE_MS = 60_000;

/**
 * 연도별 공휴일 = 규칙 계산 + 임시공휴일(ongi_configs).
 * 임시공휴일(선거일 등) 추가는 운영 DB 에서:
 *   INSERT INTO ongi_configs (key, value) VALUES ('extra_holidays', '[{"date":"2026-06-03","name":"지방선거"}]')
 *   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
 */
@Injectable()
export class OngiScanHolidaysUseCase {
  private readonly cached = new Map<number, { value: OngiHoliday[]; at: number }>();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(year: number): Promise<OngiHoliday[]> {
    const hit = this.cached.get(year);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

    const holidays = holidaysOf(year);

    try {
      const rows: { value: string }[] = await this.dataSource.query(`SELECT value FROM ongi_configs WHERE key = 'extra_holidays'`);
      const raw = rows[0]?.value;
      if (raw) {
        const extras = JSON.parse(raw) as { date?: string; name?: string }[];
        for (const extra of extras) {
          if (typeof extra?.date === 'string' && extra.date.startsWith(String(year)) && !holidays.some(holiday => holiday.date === extra.date)) {
            holidays.push({ date: extra.date, name: typeof extra.name === 'string' && extra.name.length > 0 ? extra.name : '임시공휴일' });
          }
        }
        holidays.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      }
    } catch {
      // 임시공휴일 조회·파싱 실패는 무시 — 규칙 기반 공휴일만 내려간다
    }

    this.cached.set(year, { value: holidays, at: Date.now() });

    return holidays;
  }
}
