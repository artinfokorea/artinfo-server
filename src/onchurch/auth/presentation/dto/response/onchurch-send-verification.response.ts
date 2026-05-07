import { ApiProperty } from '@nestjs/swagger';

export class OnchurchSendVerificationResponse {
  @ApiProperty({ type: Boolean, required: true, description: '인증번호 발송 여부' })
  sent: boolean;

  constructor(sent: boolean) {
    this.sent = sent;
  }
}

export class OnchurchVerifyCodeResponse {
  @ApiProperty({ type: Boolean, required: true, description: '인증번호 검증 결과' })
  verified: boolean;

  constructor(verified: boolean) {
    this.verified = verified;
  }
}
