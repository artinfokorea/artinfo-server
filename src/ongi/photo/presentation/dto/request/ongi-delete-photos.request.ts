import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class OngiDeletePhotosRequest {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: true, description: '삭제할 사진 id 목록 (최대 500)', example: ['1', '2'] })
  photoIds: string[];

  toPhotoIds(): number[] {
    return [...new Set(this.photoIds.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0))];
  }
}
