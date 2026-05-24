import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchBannerWriteCommand } from '@/onchurch/banner/application/command/onchurch-banner-write.command';

export class OnchurchBannerWriteRequest {
  @IsOptional()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, description: '배너 제목', nullable: true })
  title?: string | null;

  @IsOptional()
  @MaxLength(300)
  @ApiProperty({ type: String, required: false, description: '배너 설명', nullable: true })
  description?: string | null;

  @NotBlank()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: true, description: '배너 이미지 URL' })
  imageUrl: string;

  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: false, description: '클릭 시 이동할 URL', nullable: true })
  linkUrl: string | null;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서 (낮을수록 먼저 노출)', example: 0 })
  sortOrder: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, description: '활성 여부', example: true })
  isActive?: boolean;

  toCommand(): OnchurchBannerWriteCommand {
    return new OnchurchBannerWriteCommand({
      title: this.title ?? '',
      description: this.description ?? null,
      imageUrl: this.imageUrl,
      linkUrl: this.linkUrl ?? null,
      sortOrder: this.sortOrder ?? 0,
      isActive: this.isActive ?? true,
    });
  }
}
