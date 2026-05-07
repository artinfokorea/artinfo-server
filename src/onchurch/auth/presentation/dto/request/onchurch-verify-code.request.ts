import { ApiProperty } from '@nestjs/swagger';
import { IsPhone, NotBlank } from '@/common/decorator/validator';

export class OnchurchVerifyCodeRequest {
  @NotBlank()
  @IsPhone()
  @ApiProperty({ type: String, required: true, description: '휴대폰 번호 (010-XXXX-XXXX)', example: '010-1234-5678' })
  phone: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '6자리 인증번호', example: '123456' })
  code: string;
}
