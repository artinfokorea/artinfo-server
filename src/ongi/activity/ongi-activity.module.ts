import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ONGI_ACTIVITY_REPOSITORY } from '@/ongi/activity/domain/repository/ongi-activity.repository.interface';
import { OngiActivityRepository } from '@/ongi/activity/infrastructure/repository/ongi-activity.repository';
import { OngiActivityTracker } from '@/ongi/activity/application/service/ongi-activity-tracker';
import { OngiRecordActivityPingUseCase } from '@/ongi/activity/application/usecase/ongi-activity.usecase';
import { OngiActivityController } from '@/ongi/activity/presentation/controller/ongi-activity.controller';
import { OngiActivityMiddleware } from '@/ongi/activity/presentation/middleware/ongi-activity.middleware';

@Module({
  controllers: [OngiActivityController],
  providers: [
    { provide: ONGI_ACTIVITY_REPOSITORY, useClass: OngiActivityRepository },
    OngiActivityTracker,
    OngiRecordActivityPingUseCase,
    OngiActivityMiddleware,
  ],
})
export class OngiActivityModule implements NestModule {
  /** 온기 앱 API 만 — 관리자 페이지(/ongi/admin)는 운영자의 접속이라 사용자 지표에서 뺀다 */
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(OngiActivityMiddleware)
      .exclude({ path: 'ongi/admin/(.*)', method: RequestMethod.ALL })
      .forRoutes({ path: 'ongi/*', method: RequestMethod.ALL });
  }
}
