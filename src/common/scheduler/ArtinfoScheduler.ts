import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PerformanceService } from '@/performance/performance.service';

@Injectable()
export class ArtinfoScheduler {
  private readonly logger = new Logger(ArtinfoScheduler.name);

  constructor(private readonly performanceService: PerformanceService) {}

  @Cron('0 0 3 * * *', {
    name: 'dailyScrap',
    timeZone: 'Asia/Seoul',
  })
  async handleDailyScrap() {
    const startTime = Date.now();
    this.logger.log('스케줄 시작: scrapPerformances 호출 (03:00 KST 기준)');

    try {
      await this.performanceService.scrapPerformances();
      const durationMs = Date.now() - startTime;
      this.logger.log(`스케줄 완료: scrapPerformances 정상 종료 (소요 시간: ${durationMs}ms)`);
    } catch (err) {
      const durationMs = Date.now() - startTime;
      this.logger.error(`스케줄 실패: scrapPerformances 실행 중 에러 발생 (소요 시간: ${durationMs}ms)`, err as any);
    }
  }
}
