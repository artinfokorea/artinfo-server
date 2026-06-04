import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class OnchurchCommunityPostHideRequest {
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '숨김 여부' })
  isHidden: boolean;
}
