import { Inject, Injectable } from '@nestjs/common';
import { IAzeyoNotificationSender, NotificationPayload } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AZEYO_NOTIFICATION_REPOSITORY, IAzeyoNotificationRepository } from '@/azeyo/notification/domain/repository/azeyo-notification.repository.interface';
import { AZEYO_NOTIFICATION_SETTING_REPOSITORY, IAzeyoNotificationSettingRepository } from '@/azeyo/notification/domain/repository/azeyo-notification-setting.repository.interface';
import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';
import { AzeyoGateway } from '@/azeyo/gateway/azeyo.gateway';

@Injectable()
export class AzeyoInAppNotificationSenderService implements IAzeyoNotificationSender {
  constructor(
    @Inject(AZEYO_NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IAzeyoNotificationRepository,
    @Inject(AZEYO_NOTIFICATION_SETTING_REPOSITORY)
    private readonly settingRepository: IAzeyoNotificationSettingRepository,
    private readonly gateway: AzeyoGateway,
  ) {}

  async send(payload: NotificationPayload): Promise<void> {
    const setting = await this.settingRepository.findByUserId(payload.userId);
    if (setting && !this.isEnabled(setting, payload.type)) return;

    const notification = await this.notificationRepository.create({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      referenceId: payload.referenceId ?? null,
    });

    // 소켓으로 실시간 전송
    this.gateway.sendNotificationToUser(payload.userId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      referenceId: notification.referenceId,
      createdAt: notification.createdAt,
    });
  }

  private isEnabled(setting: { scheduleEnabled: boolean; commentEnabled: boolean; likeEnabled: boolean; jokboCopyEnabled: boolean; communityEnabled: boolean; marketingEnabled: boolean }, type: AZEYO_NOTIFICATION_TYPE): boolean {
    switch (type) {
      case AZEYO_NOTIFICATION_TYPE.SCHEDULE: return setting.scheduleEnabled;
      case AZEYO_NOTIFICATION_TYPE.COMMENT: return setting.commentEnabled;
      case AZEYO_NOTIFICATION_TYPE.LIKE: return setting.likeEnabled;
      case AZEYO_NOTIFICATION_TYPE.JOKBO_COPY: return setting.jokboCopyEnabled;
      case AZEYO_NOTIFICATION_TYPE.SYSTEM: return setting.marketingEnabled;
      default: return true;
    }
  }
}
