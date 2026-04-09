import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoNotification } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';
import { AzeyoNotificationSetting } from '@/azeyo/notification/domain/entity/azeyo-notification-setting.entity';
import { AzeyoAlimtalkHistory } from '@/azeyo/notification/domain/entity/azeyo-alimtalk-history.entity';
import { AzeyoGatewayModule } from '@/azeyo/gateway/azeyo-gateway.module';
import { AzeyoNotificationController } from '@/azeyo/notification/presentation/controller/azeyo-notification.controller';
import { AZEYO_NOTIFICATION_REPOSITORY } from '@/azeyo/notification/domain/repository/azeyo-notification.repository.interface';
import { AZEYO_NOTIFICATION_SETTING_REPOSITORY } from '@/azeyo/notification/domain/repository/azeyo-notification-setting.repository.interface';
import { AZEYO_NOTIFICATION_SENDER } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AzeyoNotificationRepository } from '@/azeyo/notification/infrastructure/repository/azeyo-notification.repository';
import { AzeyoNotificationSettingRepository } from '@/azeyo/notification/infrastructure/repository/azeyo-notification-setting.repository';
import { AzeyoInAppNotificationSenderService } from '@/azeyo/notification/infrastructure/service/azeyo-in-app-notification-sender.service';
import { AzeyoScanNotificationsUseCase } from '@/azeyo/notification/application/usecase/azeyo-scan-notifications.usecase';
import { AzeyoMarkNotificationsReadUseCase } from '@/azeyo/notification/application/usecase/azeyo-mark-notifications-read.usecase';
import { AzeyoScanNotificationSettingsUseCase } from '@/azeyo/notification/application/usecase/azeyo-scan-notification-settings.usecase';
import { AzeyoUpdateNotificationSettingsUseCase } from '@/azeyo/notification/application/usecase/azeyo-update-notification-settings.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([AzeyoNotification, AzeyoNotificationSetting, AzeyoAlimtalkHistory]), AzeyoGatewayModule],
  controllers: [AzeyoNotificationController],
  providers: [
    // UseCases
    AzeyoScanNotificationsUseCase,
    AzeyoMarkNotificationsReadUseCase,
    AzeyoScanNotificationSettingsUseCase,
    AzeyoUpdateNotificationSettingsUseCase,
    // Repositories
    { provide: AZEYO_NOTIFICATION_REPOSITORY, useClass: AzeyoNotificationRepository },
    { provide: AZEYO_NOTIFICATION_SETTING_REPOSITORY, useClass: AzeyoNotificationSettingRepository },
    // Sender
    { provide: AZEYO_NOTIFICATION_SENDER, useClass: AzeyoInAppNotificationSenderService },
  ],
  exports: [AZEYO_NOTIFICATION_SENDER, AZEYO_NOTIFICATION_SETTING_REPOSITORY],
})
export class AzeyoNotificationModule {}
