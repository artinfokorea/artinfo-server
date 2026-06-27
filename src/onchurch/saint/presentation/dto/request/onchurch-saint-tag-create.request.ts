import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchSaintTagCreateRequest {
  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '태그 이름', example: '청년부' })
  name: string;
}
