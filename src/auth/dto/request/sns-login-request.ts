import { ApiProperty } from '@nestjs/swagger';
import { Enum, NotBlank } from '@/common/decorator/validator';
import { SNS_TYPE } from '@/auth/entity/auth.entity';

export class SnsLoginRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'SNS 로그인 토큰', example: 'fdsafasdfasdf1fdsdf3' })
  token: string;

  @Enum(SNS_TYPE)
  @ApiProperty({ enum: SNS_TYPE, enumName: 'AUTH_TYPE', required: true, description: 'SNS 로그인 타입', example: SNS_TYPE.KAKAO })
  type: SNS_TYPE;
}
