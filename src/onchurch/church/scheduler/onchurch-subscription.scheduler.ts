import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OnchurchAutoUnpublishExpiredUseCase } from '@/onchurch/church/application/usecase/onchurch-auto-unpublish-expired.usecase';

@Injectable()
export class OnchurchSubscriptionScheduler {
  private readonly logger = new Logger(OnchurchSubscriptionScheduler.name);

  constructor(private readonly autoUnpublishUseCase: OnchurchAutoUnpublishExpiredUseCase) {}

  // 매시 정각(KST). 무료체험 대상자(결제 이력 없음 + free_trial 만료)인 published 교회 사이트만 OFF.
  // 결제 이력이 있는 교회는 결제가 만료돼도 이 배치로 자동 OFF하지 않는다.
  @Cron('0 0 * * * *', { name: 'onchurchAutoUnpublishExpired', timeZone: 'Asia/Seoul' })
  async runAutoUnpublishExpired(): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await this.autoUnpublishUseCase.execute();
      const ms = Date.now() - startTime;
      if (result.expiredCount === 0) {
        this.logger.log(`자동 OFF 스케줄: 만료 published 없음 (${ms}ms)`);
      } else {
        this.logger.log(
          `자동 OFF 스케줄: ${result.unpublishedCount}/${result.expiredCount}개 OFF 처리 (${ms}ms) slugs=${result.slugs.join(',')}`,
        );
      }
    } catch (err) {
      const ms = Date.now() - startTime;
      this.logger.error(`자동 OFF 스케줄 실패 (${ms}ms)`, err as any);
    }
  }
}
