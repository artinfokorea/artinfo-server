import { ApiProperty } from '@nestjs/swagger';

export class OnchurchChurchGoogleVerificationResponse {
  @ApiProperty({ type: String, nullable: true, description: '구글 서치콘솔 사이트 인증 코드' }) googleVerification: string | null;

  constructor(googleVerification: string | null) {
    this.googleVerification = googleVerification;
  }
}
