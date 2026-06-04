import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchLoginCommand } from '@/onchurch/auth/application/command/onchurch-login.command';

export class OnchurchLoginRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '아이디', example: 'test01' })
  userId: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '비밀번호', example: 'pw12345678' })
  password: string;

  @IsOptional()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, description: '교회 사이트 로그인 시 해당 교회 slug', nullable: true, example: 'sungdong' })
  churchSlug?: string | null;

  toCommand(): OnchurchLoginCommand {
    return new OnchurchLoginCommand({
      userId: this.userId,
      password: this.password,
      churchSlug: (this.churchSlug ?? '').trim() || null,
    });
  }
}
