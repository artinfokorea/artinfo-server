import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SCHEDULER_LOCK_TTL_MS, SchedulerLockService } from '@/common/scheduler/scheduler-lock.service';
import { ContestCompetitionCrawler } from './contest-competition.crawler';

/** 매일 23:10 KST (채용 크롤러 23:00 직후) 콩쿠르 수집 — 인스턴스 2대 중 락을 잡은 한 대만 */
@Injectable()
export class CompetitionCrawlerScheduler {
  private readonly logger = new Logger(CompetitionCrawlerScheduler.name);

  constructor(
    private readonly crawler: ContestCompetitionCrawler,
    private readonly schedulerLock: SchedulerLockService,
  ) {}

  @Cron('0 10 23 * * *', { name: 'dailyCompetitionCrawl', timeZone: 'Asia/Seoul' })
  async handleDailyCrawl(): Promise<void> {
    await this.schedulerLock.runExclusive('dailyCompetitionCrawl', SCHEDULER_LOCK_TTL_MS.DAILY, async () => {
      try {
        const s = await this.crawler.crawl();
        this.logger.log(
          `콩쿠르 수집: ${s.scanned}건 중 대상 ${s.matched} · 신규 ${s.created.length} · 갱신 ${s.updated.length} · 건너뜀 ${s.skipped.length} · 실패 ${s.failed.length} (${s.elapsedMs}ms)`,
        );
      } catch (error) {
        this.logger.error(`콩쿠르 수집 실패: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }
}
