import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchNoticeWriteCommand } from '@/onchurch/notice/application/command/onchurch-notice-write.command';

export class OnchurchNoticeWriteRequest {
  @IsOptional()
  @MaxLength(50)
  @ApiProperty({ type: String, required: false, description: '카테고리', nullable: true, example: '공지' })
  category: string | null;

  @NotBlank()
  @MaxLength(300)
  @ApiProperty({ type: String, required: true, description: '제목', example: '[공지] 새가족반 등록 안내' })
  title: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '본문', nullable: true })
  content: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false, description: '첨부 이미지 URL 목록' })
  imageUrls?: string[];

  @IsOptional()
  @MaxLength(80)
  @ApiProperty({ type: String, required: false, description: '작성자 표시명', nullable: true })
  author: string | null;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '상단 고정 여부' })
  isPinned: boolean;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  @IsOptional()
  @IsISO8601()
  @ApiProperty({ type: String, required: false, description: '게시 시각 (ISO8601)', nullable: true })
  publishedAt: string | null;

  toCommand(): OnchurchNoticeWriteCommand {
    return new OnchurchNoticeWriteCommand({
      category: (this.category ?? '').trim() || null,
      title: this.title.trim(),
      content: this.content ?? null,
      imageUrls: Array.isArray(this.imageUrls) ? this.imageUrls : [],
      author: (this.author ?? '').trim() || null,
      isPinned: !!this.isPinned,
      isActive: !!this.isActive,
      publishedAt: this.publishedAt ? new Date(this.publishedAt) : null,
    });
  }
}
