import { ApiProperty } from '@nestjs/swagger';
import { Enum, NotBlank } from '@/common/decorator/validator';
import { SALPYEO_SNS_TYPE } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';

export class SalpyeoSnsLoginRequest {
  @Enum(SALPYEO_SNS_TYPE)
  @ApiProperty({ enum: SALPYEO_SNS_TYPE, required: true, description: '소셜 로그인 제공자', example: SALPYEO_SNS_TYPE.GOOGLE })
  provider: SALPYEO_SNS_TYPE;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '프론트가 받아온 구글 access token', example: 'ya29.a0...' })
  token: string;
}
