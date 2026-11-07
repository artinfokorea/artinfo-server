import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class RegisterPushTokenRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'Expo Push Token', example: 'ExponentPushToken[xxxxxxxx]' })
  token: string;

  @IsOptional()
  @IsIn(['ios', 'android'])
  @ApiProperty({ type: String, required: false, description: '플랫폼 (기본 ios)', example: 'ios' })
  platform?: string;
}

export class UnregisterPushTokenRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'Expo Push Token', example: 'ExponentPushToken[xxxxxxxx]' })
  token: string;
}

/** 바꿀 항목만 보내면 된다 — 빠진 항목은 유지 */
export class UpdatePushPreferencesRequest {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, description: '새 채용 공고 알림' })
  job?: boolean;
}
