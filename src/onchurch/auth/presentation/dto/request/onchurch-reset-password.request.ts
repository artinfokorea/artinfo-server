import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength, MinLength } from 'class-validator';
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

  @IsOptional()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, description: '교회 사이트에서 재설정하는 경우 해당 교회 slug (해당 교회 소속 계정만 허용)', nullable: true, example: 'sungdong' })
  churchSlug?: string | null;
}
