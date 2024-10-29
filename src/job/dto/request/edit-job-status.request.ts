import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class EditJobStatusRequest {
  @IsBoolean()
  @ApiProperty({ type: 'boolean', required: true, description: '활성화 여부', example: true })
  isActive: boolean;
}
