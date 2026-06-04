import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchCommunityPostWriteCommand } from '@/onchurch/community/application/command/onchurch-community-post-write.command';

export class OnchurchCommunityPostWriteRequest {
  @IsOptional()
  @MaxLength(50)
  @ApiProperty({ type: String, required: false, description: '카테고리', nullable: true, example: '간증' })
  category: string | null;

  @NotBlank()
  @MaxLength(300)
  @ApiProperty({ type: String, required: true, description: '제목', example: '오늘의 감사' })
  title: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '본문', nullable: true })
  content: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false, description: '업로드된 사진 URL 목록', example: [] })
  photoUrls?: string[];

  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: false, description: '외부 동영상 링크(YouTube/Vimeo 등)', nullable: true })
  videoUrl: string | null;

  toCommand(): OnchurchCommunityPostWriteCommand {
    return new OnchurchCommunityPostWriteCommand({
      category: (this.category ?? '').trim() || null,
      title: this.title.trim(),
      content: this.content ?? null,
      photoUrls: Array.isArray(this.photoUrls) ? this.photoUrls.filter((u) => typeof u === 'string' && u.trim()) : [],
      videoUrl: (this.videoUrl ?? '').trim() || null,
    });
  }
}
