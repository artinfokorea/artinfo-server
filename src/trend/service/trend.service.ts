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
// 캐시 만료 시 이 시간 이내의 생성 이력이 있으면 그것부터 즉시 반환 (serve-stale)
const STALE_MAX_AGE_HOURS = Number(process.env['TREND_SUMMARY_STALE_MAX_AGE_HOURS'] ?? 6);
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

  /** 선생성 스케줄러용 — 기본 옵션(kr, 10건) 기준 캐시 남은 TTL(초). 캐시에 없으면 음수 */
  async cacheTtlSec(keyword: string, region = 'kr', limit = 10): Promise<number> {
    const normalized = keyword.trim().replace(/\s+/g, ' ');
    return this.redis.redisClient.ttl(this.cacheKey(region, normalized, limit));
  }

  async getSummary(request: GetTrendSummaryRequest): Promise<TrendSummaryResponse> {
    const keyword = request.keyword.trim().replace(/\s+/g, ' ');
    const cacheKey = this.cacheKey(request.region, keyword, request.limit);

    const cached = await this.redis.getByKey(cacheKey);
    if (cached) return new TrendSummaryResponse({ ...cached, cached: true });

    // 캐시 미스 — 최근 이력이 있으면 그것부터 즉시 반환하고, 새 요약은 백그라운드에서 생성 (클릭 대기 제거)
    const stale = await this.findStale(keyword, request);

    const pending = this.inflight.get(cacheKey);
    if (pending) return stale ?? pending;

    const task = this.generateWithLock(cacheKey, keyword, request).finally(() => this.inflight.delete(cacheKey));
    this.inflight.set(cacheKey, task);
    if (stale) {
      task.catch(e => this.logger.warn(`백그라운드 재생성 실패 "${keyword}": ${(e as Error).message}`));
      return stale;
    }
    return task;
  }

  /** 선생성 스케줄러용 — 캐시를 읽지 않고 새로 생성해 캐시를 덮어쓴다 (만료 전 미리 갱신) */
  async refresh(request: GetTrendSummaryRequest): Promise<TrendSummaryResponse> {
    const keyword = request.keyword.trim().replace(/\s+/g, ' ');
    const cacheKey = this.cacheKey(request.region, keyword, request.limit);

    const pending = this.inflight.get(cacheKey);
    if (pending) return pending;

    const task = this.generateWithLock(cacheKey, keyword, request).finally(() => this.inflight.delete(cacheKey));
    this.inflight.set(cacheKey, task);
    return task;
  }

  private async findStale(keyword: string, request: GetTrendSummaryRequest): Promise<TrendSummaryResponse | null> {
    const row = await this.summaryRepository.findLatest(keyword, request.region, STALE_MAX_AGE_HOURS).catch(() => null);
    if (!row) return null;
    return new TrendSummaryResponse({
      keyword,
      region: row.region,
      headline: row.headline,
      summary: row.summary,
      bullets: row.bullets ?? [],
      people: (row.people ?? []) as TrendSummaryResponse['people'],
      articles: (row.articles ?? []) as TrendSummaryResponse['articles'],
      model: row.model,
      generatedAt: row.generatedAt.toISOString(),
      cached: true,
      stale: true,
    });
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
