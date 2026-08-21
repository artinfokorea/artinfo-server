import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrendSummaryEntity } from '@/trend/entity/trend-summary.entity';
import { TrendSummaryResponse } from '@/trend/dto/response/trend-summary.response';

export interface StoredSummary {
  headline: string;
  summary: string;
  bullets: string[];
  people: unknown[];
  generatedAt: string;
}

@Injectable()
export class TrendSummaryRepository {
  constructor(
    @InjectRepository(TrendSummaryEntity)
    private readonly repo: Repository<TrendSummaryEntity>,
  ) {}

  async save(r: TrendSummaryResponse): Promise<void> {
    await this.repo.insert({
      keyword: r.keyword,
      region: r.region,
      headline: r.headline,
      summary: r.summary,
      bullets: r.bullets,
      people: r.people ?? [],
      articles: r.articles,
      model: r.model,
      generatedAt: new Date(r.generatedAt),
    });
  }

  /**
   * 키워드의 여러 시점(peakAt)에 가장 가까운 요약을 한 번의 쿼리로 찾는다.
   * 결산 페이지에서 "그 시각에 왜 올랐는지"를 붙이기 위한 용도 — ±windowHours 밖이면 null.
   */
  async findNearest(targets: { keyword: string; at: string }[], windowHours = 12): Promise<Map<string, StoredSummary>> {
    const out = new Map<string, StoredSummary>();
    if (targets.length === 0) return out;

    const windowMs = windowHours * 3_600_000;
    const rows = await this.repo
      .createQueryBuilder('s')
      .select(['s.keyword', 's.headline', 's.summary', 's.bullets', 's.people', 's.generatedAt'])
      .where('s.keyword IN (:...keywords)', { keywords: [...new Set(targets.map(t => t.keyword))] })
      .andWhere('s.generated_at BETWEEN :from AND :to', {
        from: new Date(Math.min(...targets.map(t => +new Date(t.at))) - windowMs),
        to: new Date(Math.max(...targets.map(t => +new Date(t.at))) + windowMs),
      })
      .getMany();

    for (const t of targets) {
      const at = +new Date(t.at);
      let best: TrendSummaryEntity | null = null;
      let bestDiff = windowMs + 1;
      for (const r of rows) {
        if (r.keyword !== t.keyword) continue;
        const diff = Math.abs(+r.generatedAt - at);
        if (diff < bestDiff) {
          best = r;
          bestDiff = diff;
        }
      }
      if (best) {
        out.set(t.keyword, {
          headline: best.headline,
          summary: best.summary,
          bullets: best.bullets ?? [],
          people: best.people ?? [],
          generatedAt: best.generatedAt.toISOString(),
        });
      }
    }
    return out;
  }
}
