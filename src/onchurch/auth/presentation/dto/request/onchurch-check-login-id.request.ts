import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchCheckLoginIdRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '중복 확인할 아이디', example: 'test01' })
  loginId: string;
}
