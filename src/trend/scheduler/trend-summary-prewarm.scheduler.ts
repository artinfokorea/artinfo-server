import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { TrendService } from '@/trend/service/trend.service';
import { GetTrendSummaryRequest } from '@/trend/dto/request/get-trend-summary.request';

/**
 * 실시간 검색어 1~10위 요약 선생성(prewarm)
 * 매분 통합 순위를 읽어 캐시에 없는 키워드만 요약을 만들어 둔다.
 * 비용은 "새로 진입한 키워드 수 × TTL 만료 재생성"으로만 발생한다 (약 $10~20/월).
 */
const TRENDS_URL = process.env['TREND_FRONTEND_TRENDS_URL'] || 'https://trendnews.co.kr/api/trends/all';
const PREWARM_ENABLED = process.env['TREND_PREWARM_ENABLED'] !== 'false';
const PREWARM_TOP_N = Number(process.env['TREND_PREWARM_TOP_N'] ?? 10);
const SCHEDULER_LOCK_KEY = 'trend:prewarm:scheduler-lock';
const SCHEDULER_LOCK_MS = 55 * 1000; // 컨테이너 2대 중 한 곳만 실행

@Injectable()
export class TrendSummaryPrewarmScheduler {
  private readonly logger = new Logger(TrendSummaryPrewarmScheduler.name);
  private running = false;

  constructor(
    private readonly redis: RedisRepository,
    private readonly trendService: TrendService,
  ) {}

  @Cron('* * * * *', { name: 'trendSummaryPrewarm', timeZone: 'Asia/Seoul' })
  async prewarm(): Promise<void> {
    if (!PREWARM_ENABLED || this.running) return;
    if (!(await this.redis.acquireLock(SCHEDULER_LOCK_KEY, SCHEDULER_LOCK_MS))) return;

    this.running = true;
    try {
      const keywords = await this.fetchTopKeywords();
      if (keywords.length === 0) return;

      const missing: string[] = [];
      for (const keyword of keywords) {
        if (!(await this.trendService.isCached(keyword))) missing.push(keyword);
      }
      if (missing.length === 0) return;

      this.logger.log(`선생성 대상 ${missing.length}개: ${missing.join(', ')}`);
      // AI 호출 버스트를 피하기 위해 순차 처리 (1개당 5~10초, 최대 10개)
      for (const keyword of missing) {
        try {
          const request = new GetTrendSummaryRequest();
          request.keyword = keyword;
          await this.trendService.getSummary(request);
        } catch (e) {
          this.logger.warn(`선생성 실패 "${keyword}": ${(e as Error).message}`);
        }
      }
    } catch (e) {
      this.logger.error(`선생성 스케줄러 오류: ${(e as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  private async fetchTopKeywords(): Promise<string[]> {
    const { data } = await axios.get(TRENDS_URL, { timeout: 15000 });
    const items: { rank: number; keyword: string }[] = data?.combined?.items ?? [];
    return items.filter(i => i.rank <= PREWARM_TOP_N && typeof i.keyword === 'string' && i.keyword.trim()).map(i => i.keyword.trim());
  }
}
