import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SCHEDULER_LOCK_TTL_MS, SchedulerLockService } from '@/common/scheduler/scheduler-lock.service';
import { ArtinfoPushService } from '@/push/artinfo-push.service';

/** 매일 12:00 KST 에 어제 등록된 채용 공고 요약 푸시 — 인스턴스 2대 중 Redis 락을 잡은 한 대만 보낸다 */
@Injectable()
export class ArtinfoPushScheduler {
  private readonly logger = new Logger(ArtinfoPushScheduler.name);

  constructor(
    private readonly pushService: ArtinfoPushService,
    private readonly schedulerLock: SchedulerLockService,
  ) {}

  @Cron('0 0 12 * * *', { name: 'artinfoJobDigestPush', timeZone: 'Asia/Seoul' })
  async handleDailyJobDigest(): Promise<void> {
    await this.schedulerLock.runExclusive('artinfoJobDigestPush', SCHEDULER_LOCK_TTL_MS.DAILY, async () => {
      try {
        await this.pushService.sendJobDigest();
      } catch (error) {
        this.logger.error(`채용 요약 푸시 실패: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }
}
