import { NotBlank } from '@/common/decorator/validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyPartTimeJobRequest {
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '자기 소개', example: '안녕하세요' })
  profile: string;
}
