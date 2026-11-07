import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
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

/** 관리자 테스트 발송 */
export class SendTestPushRequest {
  @IsIn(['ADMIN', 'ALL'])
  @ApiProperty({ type: String, required: true, description: '대상 — ADMIN: 관리자 계정 기기만, ALL: 등록된 전체 기기', example: 'ADMIN' })
  target: 'ADMIN' | 'ALL';

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '제목 (기본: 아트인포 테스트 푸시)' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '본문 (기본: 푸시 테스트 메시지입니다.)' })
  body?: string;
}
