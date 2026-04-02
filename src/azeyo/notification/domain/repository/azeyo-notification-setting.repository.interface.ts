import { AzeyoNotificationSetting } from '@/azeyo/notification/domain/entity/azeyo-notification-setting.entity';

export const AZEYO_NOTIFICATION_SETTING_REPOSITORY = Symbol('AZEYO_NOTIFICATION_SETTING_REPOSITORY');

export interface IAzeyoNotificationSettingRepository {
  findByUserId(userId: number): Promise<AzeyoNotificationSetting | null>;
  upsert(userId: number, settings: Partial<AzeyoNotificationSetting>): Promise<AzeyoNotificationSetting>;
}
