import { ApiProperty } from '@nestjs/swagger';

export class OnchurchChurchNaverVerificationResponse {
  @ApiProperty({ type: String, nullable: true, description: '네이버 사이트 인증 코드' }) naverVerification: string | null;

  constructor(naverVerification: string | null) {
    this.naverVerification = naverVerification;
  }
}
