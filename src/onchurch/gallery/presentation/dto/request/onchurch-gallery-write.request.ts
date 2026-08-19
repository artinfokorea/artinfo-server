import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchGalleryWriteCommand } from '@/onchurch/gallery/application/command/onchurch-gallery-write.command';
import { ONCHURCH_GALLERY_VISIBILITY } from '@/onchurch/gallery/domain/entity/onchurch-gallery.entity';

export class OnchurchGalleryWriteRequest {
  @IsOptional()
  @IsInt()
  @ApiProperty({ type: Number, required: false, nullable: true, description: '카테고리 ID' })
  categoryId: number | null;

  @IsOptional()
  @MaxLength(40)
  @ApiProperty({ type: String, required: false, nullable: true, description: '함께 업로드된 사진 묶음 ID (UUID 등)' })
  batchId: string | null;

  @NotBlank()
  @MaxLength(200)
  @ApiProperty({ type: String, required: true, description: '제목' })
  title: string;

  @IsOptional()
  @MaxLength(40)
  @ApiProperty({ type: String, required: false, nullable: true, description: '날짜 표시', example: 'JAN 01' })
  date: string | null;

  @IsOptional()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, nullable: true, description: '사진 URL' })
  photoUrl: string | null;

  @IsOptional()
  @MaxLength(32)
  @ApiProperty({ type: String, required: false, nullable: true, description: '그라디언트 색상 키', example: 'ph-grad-1' })
  grad: string | null;

  @IsOptional()
  @IsIn(Object.values(ONCHURCH_GALLERY_VISIBILITY))
  @ApiProperty({ enum: ONCHURCH_GALLERY_VISIBILITY, required: false, description: '공개 범위 (public 전체공개 | member 회원공개, 기본 public)' })
  visibility: ONCHURCH_GALLERY_VISIBILITY | null;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchGalleryWriteCommand {
    return new OnchurchGalleryWriteCommand({
      categoryId: this.categoryId ?? null,
      batchId: (this.batchId ?? '').trim() || null,
      title: this.title.trim(),
      date: (this.date ?? '').trim() || null,
      photoUrl: (this.photoUrl ?? '').trim() || null,
      grad: (this.grad ?? '').trim() || null,
      visibility: this.visibility ?? ONCHURCH_GALLERY_VISIBILITY.PUBLIC,
      sortOrder: this.sortOrder ?? 0,
      isActive: !!this.isActive,
    });
  }
}
