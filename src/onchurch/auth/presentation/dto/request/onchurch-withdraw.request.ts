import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchWithdrawRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '본인 확인용 현재 비밀번호' })
  password: string;
}
