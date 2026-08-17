import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';

export class OngiJoinGroupRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '초대 코드', example: 'ONGI-A2B3' })
  inviteCode: string;
}
