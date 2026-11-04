import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, ValidateIf } from 'class-validator';

export class OnchurchUpdateChurchGoogleVerificationRequest {
  // 구글 서치콘솔 HTML 태그 인증 코드(content 값). null이면 해제.
  @ValidateIf((o) => o.googleVerification !== null && o.googleVerification !== undefined)
  @IsString()
  @MaxLength(255)
  @ApiProperty({ type: String, required: true, nullable: true, description: '구글 서치콘솔 사이트 인증 코드. null이면 해제' })
  googleVerification: string | null;
}
