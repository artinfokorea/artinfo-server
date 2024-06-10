import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';
import { IsEmail } from 'class-validator';

export class EmailVerificationRequest {
  @IsEmail()
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '이메일', example: 'artinfokorea2022@gmail.com' })
  email: string;
}
