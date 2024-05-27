import { ApiProperty } from '@nestjs/swagger';
import { SignUpCommand } from '@/auth/dto/command/sign-up.command';
import { NotBlank, Email } from '@/common/decorator/validator';

export class SignUpRequest {
  @ApiProperty({ type: String, required: true, description: '사용자 이름', example: '임성준' })
  name: string;

  @Email()
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '사용자 이메일', example: 'artinfokorea2022@gmail.com' })
  email: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '사용자 비밀번호', example: 'a123456!' })
  password: string;

  toCommand() {
    return new SignUpCommand({
      name: this.name,
      email: this.email,
      password: this.password,
    });
  }
}
