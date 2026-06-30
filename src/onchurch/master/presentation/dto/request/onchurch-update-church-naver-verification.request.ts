import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, ValidateIf } from 'class-validator';

export class OnchurchUpdateChurchNaverVerificationRequest {
  // 네이버 사이트 인증 코드. null이면 인증 코드 해제.
  @ValidateIf((o) => o.naverVerification !== null && o.naverVerification !== undefined)
  @IsString()
  @MaxLength(255)
  @ApiProperty({ type: String, required: true, nullable: true, description: '네이버 사이트 인증 코드. null이면 해제' })
  naverVerification: string | null;
}
