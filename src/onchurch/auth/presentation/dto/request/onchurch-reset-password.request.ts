import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';
import { IsPhone, NotBlank } from '@/common/decorator/validator';

export class OnchurchResetPasswordRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '아이디', example: 'test01' })
  loginId: string;

  @NotBlank()
  @IsPhone()
  @ApiProperty({ type: String, required: true, description: '휴대폰 번호 (010-XXXX-XXXX)', example: '010-1234-5678' })
  phone: string;

  @NotBlank()
  @MinLength(8)
  @ApiProperty({ type: String, required: true, description: '새 비밀번호 (8자 이상)', example: 'pw12345678' })
  newPassword: string;
}
