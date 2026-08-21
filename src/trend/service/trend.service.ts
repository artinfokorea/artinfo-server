import { Injectable, Logger } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { RedisSetCommand } from '@/common/redis/dto/redis-set.command';
import { TrendNewsFetcher } from '@/trend/service/trend-news.fetcher';
import { TrendSummaryAiService } from '@/trend/service/trend-summary-ai.service';
import { GetTrendSummaryRequest } from '@/trend/dto/request/get-trend-summary.request';
import { TrendSummaryResponse } from '@/trend/dto/response/trend-summary.response';
import { TrendNoArticlesFound, TrendSummaryInProgress } from '@/trend/exception/trend.exception';
import { TrendSummaryRepository } from '@/trend/repository/trend-summary.repository';

/** 요약 Redis 캐시 키 — 결산 서비스도 같은 키로 캐시를 읽는다 */
export function summaryCacheKey(region: string, keyword: string, limit = 10): string {
  return `trend:summary:v2:${region}:${limit}:${keyword.trim().replace(/\s+/g, ' ').toLowerCase()}`;
}

const CACHE_TTL_SEC = Number(process.env['TREND_SUMMARY_CACHE_TTL_SEC'] ?? 2 * 60 * 60); // 기본 2시간
const LOCK_TTL_MS = 60 * 1000; // 생성 중 락 (AI 호출 + 기사 수집 최대치보다 넉넉히)
const WAIT_FOR_OTHER_MS = 45 * 1000; // 다른 인스턴스가 생성 중일 때 캐시를 기다리는 최대 시간
const WAIT_POLL_MS = 1000;

@Injectable()
export class TrendService {
  private readonly logger = new Logger(TrendService.name);
  // 같은 프로세스 내 동시 요청 중복 제거
  private readonly inflight = new Map<string, Promise<TrendSummaryResponse>>();

  constructor(
    private readonly redis: RedisRepository,
    private readonly fetcher: TrendNewsFetcher,
    private readonly ai: TrendSummaryAiService,
    private readonly summaryRepository: TrendSummaryRepository,
  ) {}

  /** 선생성 스케줄러용 — 기본 옵션(kr, 10건) 기준 캐시 존재 여부 */
  async isCached(keyword: string, region = 'kr', limit = 10): Promise<boolean> {
    const normalized = keyword.trim().replace(/\s+/g, ' ');
    return (await this.redis.redisClient.exists(this.cacheKey(region, normalized, limit))) === 1;
  }

  async getSummary(request: GetTrendSummaryRequest): Promise<TrendSummaryResponse> {
    const keyword = request.keyword.trim().replace(/\s+/g, ' ');
    const cacheKey = this.cacheKey(request.region, keyword, request.limit);

    const cached = await this.redis.getByKey(cacheKey);
    if (cached) return new TrendSummaryResponse({ ...cached, cached: true });

    const pending = this.inflight.get(cacheKey);
    if (pending) return pending;

    const task = this.generateWithLock(cacheKey, keyword, request).finally(() => this.inflight.delete(cacheKey));
    this.inflight.set(cacheKey, task);
    return task;
  }

  private async generateWithLock(cacheKey: string, keyword: string, request: GetTrendSummaryRequest): Promise<TrendSummaryResponse> {
    const lockKey = `${cacheKey}:lock`;
    const acquired = await this.redis.acquireLock(lockKey, LOCK_TTL_MS);

    if (!acquired) {
      // 다른 인스턴스가 생성 중 → 캐시가 채워질 때까지 대기
      const deadline = Date.now() + WAIT_FOR_OTHER_MS;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, WAIT_POLL_MS));
        const cached = await this.redis.getByKey(cacheKey);
        if (cached) return new TrendSummaryResponse({ ...cached, cached: true });
      }
      throw new TrendSummaryInProgress();
    }

    try {
      const result = await this.generate(keyword, request);
      await this.redis.setValue(new RedisSetCommand({ key: cacheKey, value: result, ttl: CACHE_TTL_SEC }));
      // 영구 이력 — 결산·키워드 히스토리에 쓰인다. 저장 실패가 응답을 막진 않는다
      this.summaryRepository.save(result).catch(e => this.logger.warn(`요약 이력 저장 실패 "${keyword}": ${(e as Error).message}`));
      return result;
    } finally {
      await this.redis.delete(lockKey).catch(() => {});
    }
  }

  private async generate(keyword: string, request: GetTrendSummaryRequest): Promise<TrendSummaryResponse> {
    const started = Date.now();
    const articles = await this.fetcher.fetch(keyword, request.limit);
    if (articles.length === 0) throw new TrendNoArticlesFound();

    const ai = await this.ai.summarize(keyword, articles);
    this.logger.log(`요약 생성: "${keyword}" 기사 ${articles.length}개 (본문 ${articles.filter(a => a.body).length}개) ${Date.now() - started}ms`);

    return new TrendSummaryResponse({
      keyword,
      region: request.region,
      headline: ai.headline,
      summary: ai.summary,
      bullets: ai.bullets,
      people: ai.people,
      articles: articles.map(a => ({
        title: a.title,
        press: a.press,
        link: a.link,
        publishedAt: a.publishedAt,
        hasBody: a.body.length > 0,
      })),
      model: this.ai.modelName,
      generatedAt: new Date().toISOString(),
      cached: false,
    });
  }

  private cacheKey(region: string, keyword: string, limit: number): string {
    return summaryCacheKey(region, keyword, limit);
  }
}
