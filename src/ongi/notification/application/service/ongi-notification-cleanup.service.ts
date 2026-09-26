import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IOngiNotificationRepository, ONGI_NOTIFICATION_REPOSITORY } from '@/ongi/notification/domain/repository/ongi-notification.repository.interface';
import { notificationRetentionCutoff } from '@/ongi/notification/domain/service/ongi-notification';

/** 30일 지난 알림을 매일 새벽에 지운다 — 목록 조회는 어차피 30일 안쪽만 보므로 테이블 크기만 관리 */
@Injectable()
export class OngiNotificationCleanupService {
  private readonly logger = new Logger(OngiNotificationCleanupService.name);

  constructor(
    @Inject(ONGI_NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IOngiNotificationRepository,
  ) {}

  // name 필수 — 없으면 @nestjs/schedule 이 crypto.randomUUID() 를 불러 Node 18 런타임에서 부팅이 죽는다
  @Cron(CronExpression.EVERY_DAY_AT_4AM, { name: 'ongi-notification-cleanup' })
  async cleanup(): Promise<void> {
    try {
      const deleted = await this.notificationRepository.deleteOlderThan(notificationRetentionCutoff(new Date()));
      if (deleted > 0) this.logger.log(`ongi notifications cleanup: ${deleted} deleted`);
    } catch (error) {
      this.logger.warn(`ongi notifications cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
