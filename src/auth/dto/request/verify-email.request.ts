import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';
import { IsEmail } from 'class-validator';

export class VerifyEmailRequest {
  @IsEmail()
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '휴대폰 번호', example: 'artinfokorea2022@gmail.com' })
  email: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '인증 번호', example: '051232' })
  verification: string;
}
