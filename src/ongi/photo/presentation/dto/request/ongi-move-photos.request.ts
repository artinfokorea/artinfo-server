import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class OngiMovePhotosRequest {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: true, description: '옮길 사진 id 목록 (최대 500)', example: ['1', '2'] })
  photoIds: string[];

  @IsOptional()
  @ApiProperty({ type: String, required: false, nullable: true, description: '옮길 앨범 id — 비우면 미분류로', example: '3' })
  albumId?: string | null;

  toPhotoIds(): number[] {
    return [...new Set(this.photoIds.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0))];
  }

  toAlbumId(): number | null {
    return this.albumId ? Number(this.albumId) : null;
  }
}
