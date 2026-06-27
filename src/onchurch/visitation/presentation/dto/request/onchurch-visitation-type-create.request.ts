import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchVisitationTypeCreateRequest {
  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '심방 종류 이름', example: '구역심방' })
  name: string;
}
