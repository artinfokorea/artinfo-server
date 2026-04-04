import { ApiProperty } from '@nestjs/swagger';
import { NotBlank, Enum } from '@/common/decorator/validator';
import { AZEYO_SNS_TYPE } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AzeyoSignupCommand } from '@/azeyo/auth/application/command/azeyo-signup.command';

export class AzeyoSignupRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '닉네임 (2~12자)', example: '김아재' })
  nickname: string;

  @ApiProperty({ type: String, required: false, description: '결혼 날짜 (미혼이면 null)', example: '2020-05-15', nullable: true })
  marriageDate: string | null;

  @ApiProperty({ type: String, required: true, description: '자녀 수', example: '0' })
  children: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'SNS 로그인 토큰', example: 'sns_access_token_here' })
  snsToken: string;

  @Enum(AZEYO_SNS_TYPE)
  @ApiProperty({ enum: AZEYO_SNS_TYPE, required: true, description: 'SNS 타입', example: AZEYO_SNS_TYPE.KAKAO })
  snsType: AZEYO_SNS_TYPE;

  @ApiProperty({ type: Boolean, required: false, description: '마케팅 정보 수신 동의', example: false, default: false })
  marketingConsent: boolean;

  toCommand() {
    return new AzeyoSignupCommand({
      nickname: this.nickname,
      marriageDate: this.marriageDate ?? null,
      children: this.children,
      snsToken: this.snsToken,
      snsType: this.snsType,
      marketingConsent: this.marketingConsent ?? false,
    });
  }
}
