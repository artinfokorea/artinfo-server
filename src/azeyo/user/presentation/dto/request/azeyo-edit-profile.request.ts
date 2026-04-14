import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';

export class AzeyoEditProfileRequest {
  @ApiProperty({ type: String, required: false, description: '이름', nullable: true })
  name: string | null;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '닉네임 (2~12자)' })
  nickname: string;

  @ApiProperty({ type: String, required: false, description: '한줄 소개 (최대 20자)' })
  subtitle: string | null;

  @ApiProperty({ type: String, required: false, description: '이메일', nullable: true })
  email: string | null;

  @ApiProperty({ type: String, required: false, description: '연락처', nullable: true })
  phone: string | null;
}
