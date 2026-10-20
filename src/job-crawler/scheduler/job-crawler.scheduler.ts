import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { todayInKst } from '../job-crawler.config';
import { JobCrawlerService } from '../job-crawler.service';

/** 매일 밤 11시(한국 시간) 그날 올라온 채용 공고를 모든 소스에서 동시에 수집한다 */
@Injectable()
export class JobCrawlerScheduler {
  private readonly logger = new Logger(JobCrawlerScheduler.name);

  constructor(private readonly jobCrawlerService: JobCrawlerService) {}

  @Cron('0 0 23 * * *', { name: 'dailyJobCrawl', timeZone: 'Asia/Seoul' })
  async handleDailyJobCrawl(): Promise<void> {
    const date = todayInKst();
    this.logger.log(`스케줄 시작: 채용 공고 크롤링 (${date}, 23:00 KST, 소스 ${this.jobCrawlerService.sourceKeys.join(', ')})`);
    try {
      const summaries = await this.jobCrawlerService.runAll(date);
      for (const s of summaries) {
        if (s.error) this.logger.error(`[${s.source}] 소스 실패: ${s.error}`);
        else
          this.logger.log(`[${s.source}] ${s.scanned}건 중 등록 ${s.created.length} · 건너뜀 ${s.skipped.length} · 실패 ${s.failed.length} (${s.elapsedMs}ms)`);
      }
    } catch (err) {
      this.logger.error('스케줄 실패: 채용 공고 크롤링 중 에러', err as Error);
    }
  }
}
