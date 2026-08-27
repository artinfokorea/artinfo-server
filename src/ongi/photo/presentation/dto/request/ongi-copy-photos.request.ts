import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OngiCopyPhotosRequest {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: true, description: '공유할 사진 id 목록 (최대 500)', example: ['1', '2'] })
  photoIds: string[];

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '공유 대상 가족 공간 id', example: '2' })
  targetGroupId: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, nullable: true, description: '대상 공간의 앨범 id — 비우면 미분류', example: '5' })
  albumId?: string | null;

  toPhotoIds(): number[] {
    return [...new Set(this.photoIds.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0))];
  }

  toTargetGroupId(): number {
    return Number(this.targetGroupId);
  }

  toAlbumId(): number | null {
    return this.albumId ? Number(this.albumId) : null;
  }
}
