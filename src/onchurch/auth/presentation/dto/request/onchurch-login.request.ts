import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchLoginCommand } from '@/onchurch/auth/application/command/onchurch-login.command';

export class OnchurchLoginRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '아이디', example: 'test01' })
  userId: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '비밀번호', example: 'pw12345678' })
  password: string;

  toCommand(): OnchurchLoginCommand {
    return new OnchurchLoginCommand({
      userId: this.userId,
      password: this.password,
    });
  }
}
