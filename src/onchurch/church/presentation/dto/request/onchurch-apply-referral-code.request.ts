import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchApplyReferralCodeRequest {
  @NotBlank()
  @MaxLength(20)
  @ApiProperty({ type: String, required: true, description: '다른 교회의 추천 코드(대소문자 무관)', example: 'A3K9QF' })
  code: string;
}
