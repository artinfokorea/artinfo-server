import { ApiProperty } from '@nestjs/swagger';

export class AzeyoUpdateNotificationSettingsRequest {
  @ApiProperty({ type: Boolean, required: false }) scheduleEnabled?: boolean;
  @ApiProperty({ type: Boolean, required: false }) commentEnabled?: boolean;
  @ApiProperty({ type: Boolean, required: false }) likeEnabled?: boolean;
  @ApiProperty({ type: Boolean, required: false }) jokboCopyEnabled?: boolean;
  @ApiProperty({ type: Boolean, required: false }) communityEnabled?: boolean;
  @ApiProperty({ type: Boolean, required: false }) marketingEnabled?: boolean;
}
