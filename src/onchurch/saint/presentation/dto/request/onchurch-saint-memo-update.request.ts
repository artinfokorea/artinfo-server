import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class OnchurchSaintMemoUpdateRequest {
  @IsOptional()
  @MaxLength(5000)
  @ApiProperty({ type: String, required: false, nullable: true, description: '메모' })
  memo: string | null;
}
