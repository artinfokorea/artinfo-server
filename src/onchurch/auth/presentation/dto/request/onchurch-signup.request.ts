import { ApiProperty } from '@nestjs/swagger';
import { IsPhone, NotBlank } from '@/common/decorator/validator';
import { OnchurchSignupCommand } from '@/onchurch/auth/application/command/onchurch-signup.command';

export class OnchurchSignupRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '아이디 (4자 이상)', example: 'test01' })
  userId: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '비밀번호 (8자 이상)', example: 'pw12345678' })
  password: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '이름', example: '홍길동' })
  name: string;

  @NotBlank()
  @IsPhone()
  @ApiProperty({ type: String, required: true, description: '휴대폰 번호 (010-XXXX-XXXX)', example: '010-1234-5678' })
  phone: string;

  @ApiProperty({ type: Boolean, required: false, description: '마케팅 정보 수신 동의', example: false, default: false })
  marketingConsent: boolean;

  toCommand(): OnchurchSignupCommand {
    return new OnchurchSignupCommand({
      userId: this.userId,
      password: this.password,
      name: this.name,
      phone: this.phone,
      marketingConsent: this.marketingConsent ?? false,
    });
  }
}
