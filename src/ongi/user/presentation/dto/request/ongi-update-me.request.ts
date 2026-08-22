import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OngiUpdateMeRequest {
  @NotBlank()
  @MaxLength(30)
  @ApiProperty({ type: String, required: true, description: '이름', example: '임성준' })
  name: string;
}
