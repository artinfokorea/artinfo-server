import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';

export class AzeyoCreateScheduleTagRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '태그 이름' })
  name: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '태그 색상 (hex)' })
  color: string;
}
