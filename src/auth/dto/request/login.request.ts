import { ApiProperty } from '@nestjs/swagger';
import { Email, NotBlank } from '@/common/decorator/validator';
import { EmailLoginCommand } from '@/auth/dto/command/email-login.command';

export class LoginRequest {
  @Email()
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '사용자 이메일', example: 'artinfokorea2022@gmail.com' })
  email: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '사용자 비밀번호', example: 'a123456!' })
  password: string;

  toCommand() {
    return new EmailLoginCommand({
      email: this.email,
      password: this.password,
    });
  }
}
