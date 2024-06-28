import { NotBlank } from '@/common/decorator/validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserPasswordRequest {
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '비밀번호', example: 'a123456!' })
  password: string;
}
