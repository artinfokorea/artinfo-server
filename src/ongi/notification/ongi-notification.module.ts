import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiNotification } from '@/ongi/notification/domain/entity/ongi-notification.entity';
import { ONGI_NOTIFICATION_REPOSITORY } from '@/ongi/notification/domain/repository/ongi-notification.repository.interface';
import { OngiNotificationRepository } from '@/ongi/notification/infrastructure/repository/ongi-notification.repository';
import { OngiNotificationController } from '@/ongi/notification/presentation/controller/ongi-notification.controller';
import {
  OngiNotifyService,
  OngiReadNotificationsUseCase,
  OngiScanNotificationsUseCase,
} from '@/ongi/notification/application/usecase/ongi-notification.usecase';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([OngiNotification]), OngiGroupModule],
  controllers: [OngiNotificationController],
  providers: [
    { provide: ONGI_NOTIFICATION_REPOSITORY, useClass: OngiNotificationRepository },
    OngiScanNotificationsUseCase,
    OngiReadNotificationsUseCase,
    OngiNotifyService,
  ],
  exports: [ONGI_NOTIFICATION_REPOSITORY, OngiNotifyService],
})
export class OngiNotificationModule {}
