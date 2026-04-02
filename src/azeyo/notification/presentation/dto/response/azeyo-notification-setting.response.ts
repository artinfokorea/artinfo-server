import { ApiProperty } from '@nestjs/swagger';
import { AzeyoNotificationSetting } from '@/azeyo/notification/domain/entity/azeyo-notification-setting.entity';

export class AzeyoNotificationSettingResponse {
  @ApiProperty() scheduleEnabled: boolean;
  @ApiProperty() commentEnabled: boolean;
  @ApiProperty() likeEnabled: boolean;
  @ApiProperty() jokboCopyEnabled: boolean;
  @ApiProperty() communityEnabled: boolean;
  @ApiProperty() marketingEnabled: boolean;

  constructor(s: AzeyoNotificationSetting) {
    this.scheduleEnabled = s.scheduleEnabled;
    this.commentEnabled = s.commentEnabled;
    this.likeEnabled = s.likeEnabled;
    this.jokboCopyEnabled = s.jokboCopyEnabled;
    this.communityEnabled = s.communityEnabled;
    this.marketingEnabled = s.marketingEnabled;
  }
}
