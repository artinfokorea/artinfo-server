import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OngiCreateGroupRequest {
  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '가족 공간 이름', example: '김씨네 온기' })
  name: string;
}
