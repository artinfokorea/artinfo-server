import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchChangePasswordRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '현재 비밀번호' })
  currentPassword: string;

  @NotBlank()
  @MinLength(8)
  @ApiProperty({ type: String, required: true, description: '새 비밀번호 (8자 이상)' })
  newPassword: string;
}
