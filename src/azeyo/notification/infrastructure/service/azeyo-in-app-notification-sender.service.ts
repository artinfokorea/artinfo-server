import { Inject, Injectable } from '@nestjs/common';
import { IAzeyoNotificationSender, NotificationPayload } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AZEYO_NOTIFICATION_REPOSITORY, IAzeyoNotificationRepository } from '@/azeyo/notification/domain/repository/azeyo-notification.repository.interface';
import { AZEYO_NOTIFICATION_SETTING_REPOSITORY, IAzeyoNotificationSettingRepository } from '@/azeyo/notification/domain/repository/azeyo-notification-setting.repository.interface';
import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';

/**
 * IN_APP 알림 발송 구현체
 * - DB에 알림 레코드 생성
 * - 유저의 알림 설정을 확인하여 비활성화된 타입은 생략
 *
 * 추후 KAKAO_ALIMTALK 구현체를 추가하면
 * 복합 발송기(CompositeSender)에서 채널별로 분기 가능
 */
@Injectable()
export class AzeyoInAppNotificationSenderService implements IAzeyoNotificationSender {
  constructor(
    @Inject(AZEYO_NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IAzeyoNotificationRepository,
    @Inject(AZEYO_NOTIFICATION_SETTING_REPOSITORY)
    private readonly settingRepository: IAzeyoNotificationSettingRepository,
  ) {}

  async send(payload: NotificationPayload): Promise<void> {
    // 유저 알림 설정 확인
    const setting = await this.settingRepository.findByUserId(payload.userId);
    if (setting && !this.isEnabled(setting, payload.type)) return;

    await this.notificationRepository.create({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      referenceId: payload.referenceId ?? null,
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
