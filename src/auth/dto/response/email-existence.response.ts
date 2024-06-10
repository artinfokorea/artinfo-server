import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class EmailExistenceResponse {
  @IsBoolean()
  @ApiProperty({ type: 'boolean', required: true, description: '존재 여부', example: true })
  existence: boolean;

  constructor(existence: boolean) {
    this.existence = existence;
  }
}
