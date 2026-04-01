import { ApiProperty } from '@nestjs/swagger';
import { NotBlank, Enum } from '@/common/decorator/validator';
import { AZEYO_SNS_TYPE } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';

export class AzeyoSnsLoginRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'SNS 로그인 토큰', example: 'sns_access_token_here' })
  token: string;

  @Enum(AZEYO_SNS_TYPE)
  @ApiProperty({ enum: AZEYO_SNS_TYPE, required: true, description: 'SNS 로그인 타입', example: AZEYO_SNS_TYPE.KAKAO })
  type: AZEYO_SNS_TYPE;
}
