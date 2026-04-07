import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as Redis from 'ioredis';
import { AzeyoSendScheduleNotificationsUseCase } from '@/azeyo/schedule/application/usecase/azeyo-send-schedule-notifications.usecase';
import { AZEYO_SCHEDULER_HISTORY_REPOSITORY, IAzeyoSchedulerHistoryRepository } from '@/azeyo/scheduler/domain/repository/azeyo-scheduler-history.repository.interface';
import { AZEYO_SCHEDULER_STATUS } from '@/azeyo/scheduler/domain/entity/azeyo-scheduler-history.entity';

const SCHEDULER_NAME = 'schedule-notification';
const LOCK_KEY = 'azeyo:scheduler:schedule-notification:lock';
const LOCK_TTL = 300;

@Injectable()
export class AzeyoScheduleNotificationScheduler implements OnModuleDestroy {
  private readonly logger = new Logger(AzeyoScheduleNotificationScheduler.name);
  private readonly redis: Redis.Redis;

  constructor(
    private readonly sendNotificationsUseCase: AzeyoSendScheduleNotificationsUseCase,
    @Inject(AZEYO_SCHEDULER_HISTORY_REPOSITORY)
    private readonly historyRepository: IAzeyoSchedulerHistoryRepository,
  ) {
    this.redis = new Redis.Redis({
      host: process.env['REDIS_HOST'],
      port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  @Cron('0 0 13 * * *', {
    name: 'azeyoScheduleNotification',
    timeZone: 'Asia/Seoul',
  })
  async handleScheduleNotifications() {
    const acquired = await this.redis.set(LOCK_KEY, '1', 'EX', LOCK_TTL, 'NX');
    if (!acquired) {
      this.logger.log('다른 인스턴스에서 실행 중 — 스킵');
      await this.historyRepository.record({
        schedulerName: SCHEDULER_NAME,
        status: AZEYO_SCHEDULER_STATUS.SKIPPED,
        result: '다른 인스턴스에서 실행 중',
        errorMessage: null,
        durationMs: 0,
      });
      return;
    }

    const startTime = Date.now();
    this.logger.log('일정 알림 스케줄러 시작');

    try {
      const result = await this.sendNotificationsUseCase.execute();
      const durationMs = Date.now() - startTime;
      this.logger.log(`일정 알림 발송 완료: D-3=${result.d3Count}건, D-1=${result.d1Count}건 (${durationMs}ms)`);
      await this.historyRepository.record({
        schedulerName: SCHEDULER_NAME,
        status: AZEYO_SCHEDULER_STATUS.SUCCESS,
        result: `D-3=${result.d3Count}건, D-1=${result.d1Count}건`,
        errorMessage: null,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`일정 알림 발송 실패 (${durationMs}ms)`, err);
      await this.historyRepository.record({
        schedulerName: SCHEDULER_NAME,
        status: AZEYO_SCHEDULER_STATUS.FAILURE,
        result: null,
        errorMessage,
        durationMs,
      });
    }
  }
}
