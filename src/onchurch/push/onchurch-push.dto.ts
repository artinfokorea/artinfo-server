import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchRegisterPushTokenRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'Expo Push Token', example: 'ExponentPushToken[xxxxxxxx]' })
  token: string;

  @IsOptional()
  @IsIn(['ios', 'android'])
  @ApiProperty({ type: String, required: false, description: '플랫폼 (기본 ios)', example: 'ios' })
  platform?: string;
}

export class OnchurchUnregisterPushTokenRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'Expo Push Token', example: 'ExponentPushToken[xxxxxxxx]' })
  token: string;
}

export class OnchurchUpdatePushPreferencesRequest {
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '앱 알림 받기 (새 글·댓글)' })
  enabled: boolean;
}

/** 전역 ResponseInterceptor 가 { code, message, item } 으로 감싸므로 item 내용만 둔다 */
export class OnchurchPushPreferencesResponse {
  @ApiProperty({ type: Boolean, required: true, description: '앱 알림 받기 (새 글·댓글)', example: true })
  enabled: boolean;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }
}
