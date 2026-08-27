import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OngiRegisterPushTokenRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'Expo Push Token', example: 'ExponentPushToken[xxxxxxxx]' })
  token: string;

  @IsOptional()
  @IsIn(['ios', 'android'])
  @ApiProperty({ type: String, required: false, description: '플랫폼', example: 'ios' })
  platform?: string;
}

export class OngiUnregisterPushTokenRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'Expo Push Token', example: 'ExponentPushToken[xxxxxxxx]' })
  token: string;
}
