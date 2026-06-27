import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class OnchurchSaintTagsSetRequest {
  @IsArray()
  @IsInt({ each: true })
  @ApiProperty({ type: [Number], required: true, description: '연결할 태그 ID 목록', example: [1, 2] })
  tagIds: number[];
}
