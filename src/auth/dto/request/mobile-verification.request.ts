import { ApiProperty } from '@nestjs/swagger';
import { IsPhone } from '@/common/decorator/validator';

export class MobileVerificationRequest {
  @IsPhone()
  @ApiProperty({ type: 'string', required: true, description: '휴대폰 번호', example: '010-4028-7451' })
  phone: string;
}
