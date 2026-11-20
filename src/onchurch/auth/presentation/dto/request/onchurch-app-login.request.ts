import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchAppLoginRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '아이디', example: 'test01' })
  userId: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '비밀번호', example: 'pw12345678' })
  password: string;
}
