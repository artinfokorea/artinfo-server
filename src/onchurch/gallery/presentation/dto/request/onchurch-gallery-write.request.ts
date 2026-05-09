import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchGalleryWriteCommand } from '@/onchurch/gallery/application/command/onchurch-gallery-write.command';

export class OnchurchGalleryWriteRequest {
  @IsOptional()
  @IsInt()
  @ApiProperty({ type: Number, required: false, nullable: true, description: '카테고리 ID' })
  categoryId: number | null;

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

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchGalleryWriteCommand {
    return new OnchurchGalleryWriteCommand({
      categoryId: this.categoryId ?? null,
      title: this.title.trim(),
      date: (this.date ?? '').trim() || null,
      photoUrl: (this.photoUrl ?? '').trim() || null,
      grad: (this.grad ?? '').trim() || null,
      sortOrder: this.sortOrder ?? 0,
      isActive: !!this.isActive,
    });
  }
}
