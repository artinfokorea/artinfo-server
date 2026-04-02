import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_NOTIFICATION_SETTING_REPOSITORY, IAzeyoNotificationSettingRepository } from '@/azeyo/notification/domain/repository/azeyo-notification-setting.repository.interface';
import { AzeyoNotificationSetting } from '@/azeyo/notification/domain/entity/azeyo-notification-setting.entity';

@Injectable()
export class AzeyoScanNotificationSettingsUseCase {
  constructor(
    @Inject(AZEYO_NOTIFICATION_SETTING_REPOSITORY)
    private readonly settingRepository: IAzeyoNotificationSettingRepository,
  ) {}

  async execute(userId: number): Promise<AzeyoNotificationSetting> {
    const setting = await this.settingRepository.findByUserId(userId);
    if (setting) return setting;
    // 기본 설정 생성
    return this.settingRepository.upsert(userId, {});
  }
}
