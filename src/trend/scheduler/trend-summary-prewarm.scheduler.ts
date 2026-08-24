import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { TrendService } from '@/trend/service/trend.service';
import { GetTrendSummaryRequest } from '@/trend/dto/request/get-trend-summary.request';
import { TrendArchiveService } from '@/trend/service/trend-archive.service';

/**
 * 실시간 검색어 1~10위 요약 선생성(prewarm)
 * 매분 통합 순위를 읽어 캐시에 없는 키워드만 요약을 만들어 둔다.
 * 비용은 "새로 진입한 키워드 수 × TTL 만료 재생성"으로만 발생한다 (약 $10~20/월).
 */
const TRENDS_URL = process.env['TREND_FRONTEND_TRENDS_URL'] || 'https://trendnews.co.kr/api/trends/all';
const PREWARM_ENABLED = process.env['TREND_PREWARM_ENABLED'] !== 'false';
const PREWARM_TOP_N = Number(process.env['TREND_PREWARM_TOP_N'] ?? 10);
// 캐시 남은 TTL이 이 값 이하면 만료 전에 미리 재생성 (refresh-ahead) — 만료 직후의 요약 공백 방지
const REFRESH_AHEAD_SEC = Number(process.env['TREND_PREWARM_REFRESH_AHEAD_SEC'] ?? 15 * 60);
const SCHEDULER_LOCK_KEY = 'trend:prewarm:scheduler-lock';
const SCHEDULER_LOCK_MS = 55 * 1000; // 컨테이너 2대 중 한 곳만 실행

@Injectable()
export class TrendSummaryPrewarmScheduler {
  private readonly logger = new Logger(TrendSummaryPrewarmScheduler.name);
  private running = false;

  constructor(
    private readonly redis: RedisRepository,
    private readonly trendService: TrendService,
    private readonly archive: TrendArchiveService,
  ) {}

  @Cron('* * * * *', { name: 'trendSummaryPrewarm', timeZone: 'Asia/Seoul' })
  async prewarm(): Promise<void> {
    if (this.running) return;
    if (!(await this.redis.acquireLock(SCHEDULER_LOCK_KEY, SCHEDULER_LOCK_MS))) return;

    this.running = true;
    try {
      const items = await this.fetchCombinedItems();
      if (items.length === 0) return;

      // 결산용 히스토리는 선생성 on/off와 무관하게 매분 기록
      await this.archive.record(items).catch(e => this.logger.warn(`히스토리 기록 실패: ${(e as Error).message}`));
      if (!PREWARM_ENABLED) return;

      const keywords = items.filter(i => i.rank <= PREWARM_TOP_N).map(i => i.keyword);

      // 캐시에 없는 키워드(신규 진입)를 먼저, 만료 임박 키워드(refresh-ahead)를 그 뒤에
      const missing: string[] = [];
      const expiring: string[] = [];
      for (const keyword of keywords) {
        const ttl = await this.trendService.cacheTtlSec(keyword);
        if (ttl < 0) missing.push(keyword);
        else if (ttl <= REFRESH_AHEAD_SEC) expiring.push(keyword);
      }
      const targets = [...missing, ...expiring];
      if (targets.length === 0) return;

      this.logger.log(`선생성 대상 신규 ${missing.length}개(${missing.join(', ')}) + 만료임박 ${expiring.length}개(${expiring.join(', ')})`);
      // AI 호출 버스트를 피하기 위해 순차 처리 (1개당 5~10초, 최대 10개)
      for (const keyword of targets) {
        try {
          const request = new GetTrendSummaryRequest();
          request.keyword = keyword;
          // getSummary는 serve-stale로 즉시 반환할 수 있어 캐시를 강제로 다시 채우는 refresh를 쓴다
          await this.trendService.refresh(request);
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

  private async fetchCombinedItems(): Promise<{ rank: number; keyword: string }[]> {
    const { data } = await axios.get(TRENDS_URL, { timeout: 15000 });
    const items: { rank: number; keyword: string }[] = data?.combined?.items ?? [];
    return items
      .filter(i => Number.isInteger(i.rank) && typeof i.keyword === 'string' && i.keyword.trim())
      .map(i => ({ rank: i.rank, keyword: i.keyword.trim() }));
  }
}
