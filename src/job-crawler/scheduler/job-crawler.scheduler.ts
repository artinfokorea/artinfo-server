import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { todayInKst } from '../job-crawler.config';
import { MokpoArtJobCrawler } from '../mokpo/mokpo-art-job.crawler';

/** 매일 밤 11시(한국 시간) 그날 올라온 채용 공고를 수집한다 */
@Injectable()
export class JobCrawlerScheduler {
  private readonly logger = new Logger(JobCrawlerScheduler.name);

  constructor(private readonly mokpoCrawler: MokpoArtJobCrawler) {}

  @Cron('0 0 23 * * *', { name: 'dailyJobCrawl', timeZone: 'Asia/Seoul' })
  async handleDailyJobCrawl(): Promise<void> {
    const date = todayInKst();
    this.logger.log(`스케줄 시작: 채용 공고 크롤링 (${date}, 23:00 KST)`);
    try {
      const summary = await this.mokpoCrawler.crawl(date);
      this.logger.log(
        `스케줄 완료: 목포 ${summary.scanned}건 중 등록 ${summary.created.length} · 건너뜀 ${summary.skipped.length} · 실패 ${summary.failed.length} (${summary.elapsedMs}ms)`,
      );
    } catch (err) {
      this.logger.error('스케줄 실패: 채용 공고 크롤링 중 에러', err as Error);
    }
  }
}
