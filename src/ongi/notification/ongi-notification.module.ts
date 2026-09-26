import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiNotification } from '@/ongi/notification/domain/entity/ongi-notification.entity';
import { OngiNotificationSeen } from '@/ongi/notification/domain/entity/ongi-notification-seen.entity';
import { ONGI_NOTIFICATION_REPOSITORY } from '@/ongi/notification/domain/repository/ongi-notification.repository.interface';
import { OngiNotificationRepository } from '@/ongi/notification/infrastructure/repository/ongi-notification.repository';
import { OngiNotificationController } from '@/ongi/notification/presentation/controller/ongi-notification.controller';
import {
  OngiCountUnseenNotificationsUseCase,
  OngiMarkNotificationsSeenUseCase,
  OngiScanMyNotificationsUseCase,
} from '@/ongi/notification/application/usecase/ongi-notification.usecase';
import { OngiNotificationCleanupService } from '@/ongi/notification/application/service/ongi-notification-cleanup.service';

/** 앱 내 알림 목록 — 푸시 모듈이 발송 시 여기 저장소에 남기고, 앱은 목록·안 본 개수·본 것 처리 API 를 쓴다 */
@Module({
  imports: [TypeOrmModule.forFeature([OngiNotification, OngiNotificationSeen])],
  controllers: [OngiNotificationController],
  providers: [
    { provide: ONGI_NOTIFICATION_REPOSITORY, useClass: OngiNotificationRepository },
    OngiScanMyNotificationsUseCase,
    OngiCountUnseenNotificationsUseCase,
    OngiMarkNotificationsSeenUseCase,
    OngiNotificationCleanupService,
  ],
  exports: [ONGI_NOTIFICATION_REPOSITORY],
})
export class OngiNotificationModule {}
