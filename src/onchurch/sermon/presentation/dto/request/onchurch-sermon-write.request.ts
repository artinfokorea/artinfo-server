import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchSermonWriteCommand } from '@/onchurch/sermon/application/command/onchurch-sermon-write.command';

export class OnchurchSermonWriteRequest {
  @IsOptional()
  @IsInt()
  @ApiProperty({ type: Number, required: false, nullable: true, description: '시리즈 ID', example: 1 })
  seriesId: number | null;

  @NotBlank()
  @MaxLength(200)
  @ApiProperty({ type: String, required: true, description: '제목' })
  title: string;

  @IsOptional()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, nullable: true, description: '설교자' })
  pastor: string | null;

  @IsOptional()
  @MaxLength(40)
  @ApiProperty({ type: String, required: false, nullable: true, description: '날짜', example: '2026.03.22' })
  date: string | null;

  @IsOptional()
  @MaxLength(40)
  @ApiProperty({ type: String, required: false, nullable: true, description: '재생 시간', example: '42:18' })
  duration: string | null;

  @IsOptional()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, nullable: true, description: '영상 URL' })
  videoUrl: string | null;

  @IsOptional()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, nullable: true, description: '썸네일 이미지 URL' })
  thumbnailUrl: string | null;

  @IsOptional()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, nullable: true, description: '주보 PDF URL' })
  bulletinUrl: string | null;

  @IsOptional()
  @ApiProperty({ type: String, required: false, nullable: true, description: '요약' })
  summary: string | null;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '대표 설교 여부' })
  isFeatured: boolean;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchSermonWriteCommand {
    return new OnchurchSermonWriteCommand({
      seriesId: this.seriesId ?? null,
      title: this.title.trim(),
      pastor: (this.pastor ?? '').trim() || null,
      date: (this.date ?? '').trim() || null,
      duration: (this.duration ?? '').trim() || null,
      videoUrl: (this.videoUrl ?? '').trim() || null,
      thumbnailUrl: (this.thumbnailUrl ?? '').trim() || null,
      bulletinUrl: (this.bulletinUrl ?? '').trim() || null,
      summary: this.summary ?? null,
      isFeatured: !!this.isFeatured,
      sortOrder: this.sortOrder ?? 0,
      isActive: !!this.isActive,
    });
  }
}
