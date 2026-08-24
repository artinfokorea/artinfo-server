import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TrendDailyKeyword } from '@/trend/entity/trend-daily-keyword.entity';
import { TrendDailyHourlyTop } from '@/trend/entity/trend-daily-hourly-top.entity';

export interface DailyKeywordRow {
  keyword: string;
  peak: number;
  peakAt: string;
  firstSeen: string;
  lastSeen: string;
  samples: number;
  score: number;
  /** 이슈 반응 투표 스냅샷 — 없으면 null (기능 도입 전이거나 투표 0건) */
  reactions?: Record<string, number> | null;
}

@Injectable()
export class TrendDailyRepository {
  constructor(
    @InjectRepository(TrendDailyKeyword)
    private readonly keywords: Repository<TrendDailyKeyword>,
    @InjectRepository(TrendDailyHourlyTop)
    private readonly hourly: Repository<TrendDailyHourlyTop>,
  ) {}

  /** 하루치 확정 저장 — 같은 (date, keyword)는 최신 값으로 덮어쓴다 */
  async upsertDay(date: string, rows: DailyKeywordRow[], hourlyTop: { hour: number; keyword: string }[]): Promise<void> {
    if (rows.length > 0) {
      await this.keywords
        .createQueryBuilder()
        .insert()
        .values(
          rows.map(r => ({
            date,
            keyword: r.keyword,
            peak: r.peak,
            peakAt: new Date(r.peakAt),
            firstSeen: new Date(r.firstSeen),
            lastSeen: new Date(r.lastSeen),
            samples: r.samples,
            score: r.score,
            reactions: r.reactions ?? null,
          })),
        )
        .orUpdate(['peak', 'peak_at', 'first_seen', 'last_seen', 'samples', 'score', 'reactions', 'updated_at'], ['date', 'keyword'])
        .execute();
    }
    if (hourlyTop.length > 0) {
      await this.hourly
        .createQueryBuilder()
        .insert()
        .values(hourlyTop.map(h => ({ date, hour: h.hour, keyword: h.keyword })))
        .orUpdate(['keyword'], ['date', 'hour'])
        .execute();
    }
  }

  /** 기간 내 일자별 행 — date → rows */
  async findRange(from: string, to: string): Promise<Map<string, DailyKeywordRow[]>> {
    const rows = await this.keywords.find({ where: { date: Between(from, to) } });
    const out = new Map<string, DailyKeywordRow[]>();
    for (const r of rows) {
      const date = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().slice(0, 10);
      if (!out.has(date)) out.set(date, []);
      out.get(date)!.push({
        keyword: r.keyword,
        peak: r.peak,
        peakAt: r.peakAt.toISOString(),
        firstSeen: r.firstSeen.toISOString(),
        lastSeen: r.lastSeen.toISOString(),
        samples: r.samples,
        score: r.score,
        reactions: r.reactions ?? null,
      });
    }
    return out;
  }

  async findHourlyTop(date: string): Promise<{ hour: number; keyword: string }[]> {
    const rows = await this.hourly.find({ where: { date }, order: { hour: 'ASC' } });
    return rows.map(r => ({ hour: r.hour, keyword: r.keyword }));
  }
}
