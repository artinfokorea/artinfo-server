import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_NOTIFICATION_SETTING_REPOSITORY, IAzeyoNotificationSettingRepository } from '@/azeyo/notification/domain/repository/azeyo-notification-setting.repository.interface';

@Injectable()
export class AzeyoUpdateNotificationSettingsUseCase {
  constructor(
    @Inject(AZEYO_NOTIFICATION_SETTING_REPOSITORY)
    private readonly settingRepository: IAzeyoNotificationSettingRepository,
  ) {}

  async execute(userId: number, settings: {
    scheduleEnabled?: boolean;
    commentEnabled?: boolean;
    likeEnabled?: boolean;
    jokboCopyEnabled?: boolean;
    communityEnabled?: boolean;
    marketingEnabled?: boolean;
  }): Promise<void> {
    await this.settingRepository.upsert(userId, settings);
  }
}
