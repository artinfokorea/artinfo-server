import { Email, NotBlank } from '@/common/decorator/validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserPasswordRequest {
  @Email()
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '이메일', example: 'artinfokorea2022@gmail.com' })
  email: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '비밀번호', example: 'a123456!' })
  password: string;
}
