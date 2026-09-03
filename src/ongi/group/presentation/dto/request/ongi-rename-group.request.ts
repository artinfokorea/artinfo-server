import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OngiRenameGroupRequest {
  @NotBlank()
  @MaxLength(30)
  @ApiProperty({ type: String, required: true, description: '새 공간 이름', example: '온기가족' })
  name: string;
}
