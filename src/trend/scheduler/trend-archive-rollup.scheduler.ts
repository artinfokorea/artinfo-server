import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { TrendArchiveService, addDays, kstDate } from '@/trend/service/trend-archive.service';

/**
 * 결산 롤업 — 매일 00:10 KST에 어제치를 Redis → Postgres로 확정 저장.
 * 실패·누락에 대비해 최근 ROLLUP_LOOKBACK_DAYS일을 매번 다시 덮어쓴다 (upsert라 안전).
 */
const ROLLUP_LOOKBACK_DAYS = Number(process.env['TREND_ROLLUP_LOOKBACK_DAYS'] ?? 3);
const LOCK_KEY = 'trend:archive:rollup-lock';
const LOCK_MS = 10 * 60 * 1000;

@Injectable()
export class TrendArchiveRollupScheduler {
  private readonly logger = new Logger(TrendArchiveRollupScheduler.name);

  constructor(
    private readonly redis: RedisRepository,
    private readonly archive: TrendArchiveService,
  ) {}

  @Cron('10 0 * * *', { name: 'trendArchiveRollup', timeZone: 'Asia/Seoul' })
  async rollup(): Promise<void> {
    if (!(await this.redis.acquireLock(LOCK_KEY, LOCK_MS))) return;
    try {
      const yesterday = addDays(kstDate(new Date()), -1);
      for (let i = 0; i < ROLLUP_LOOKBACK_DAYS; i++) {
        const date = addDays(yesterday, -i);
        try {
          await this.archive.rollupDay(date);
        } catch (e) {
          this.logger.error(`결산 롤업 실패 ${date}: ${(e as Error).message}`);
        }
      }
    } finally {
      await this.redis.delete(LOCK_KEY).catch(() => {});
    }
  }
}
