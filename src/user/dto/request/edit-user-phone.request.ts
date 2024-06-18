import { IsPhone } from '@/common/decorator/validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserPhoneRequest {
  @IsPhone()
  @ApiProperty({ type: 'string', required: true, description: '연락처', example: '010-4028-7451' })
  phone: string;
}
