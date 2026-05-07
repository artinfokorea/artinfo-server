import { ApiProperty } from '@nestjs/swagger';
import { IsPhone, NotBlank } from '@/common/decorator/validator';

export class OnchurchSendVerificationRequest {
  @NotBlank()
  @IsPhone()
  @ApiProperty({ type: String, required: true, description: '휴대폰 번호 (010-XXXX-XXXX)', example: '010-1234-5678' })
  phone: string;
}
