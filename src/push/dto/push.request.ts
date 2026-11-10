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

/** 관리자 테스트 발송 — 채용 요약 푸시를 지금 보낸다 (문구는 스케줄과 동일) */
export class SendTestPushRequest {
  @IsIn(['ADMIN', 'ALL'])
  @ApiProperty({ type: String, required: true, description: '대상 — ADMIN: 관리자 계정 기기만, ALL: 채용 알림 켜 둔 회원 전원', example: 'ADMIN' })
  target: 'ADMIN' | 'ALL';
}
