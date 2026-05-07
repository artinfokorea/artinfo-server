import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchBannerWriteCommand } from '@/onchurch/banner/application/command/onchurch-banner-write.command';

export class OnchurchBannerWriteRequest {
  @NotBlank()
  @MaxLength(120)
  @ApiProperty({ type: String, required: true, description: '배너 제목', example: '봄 부흥회 안내' })
  title: string;

  @IsOptional()
  @MaxLength(300)
  @ApiProperty({ type: String, required: false, description: '배너 설명', nullable: true })
  description: string | null;

  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: false, description: '배너 배경 이미지 URL', nullable: true })
  imageUrl: string | null;

  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: false, description: '클릭 시 이동할 URL', nullable: true })
  linkUrl: string | null;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서 (낮을수록 먼저 노출)', example: 0 })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부', example: true })
  isActive: boolean;

  toCommand(): OnchurchBannerWriteCommand {
    return new OnchurchBannerWriteCommand({
      title: this.title,
      description: this.description ?? null,
      imageUrl: this.imageUrl ?? null,
      linkUrl: this.linkUrl ?? null,
      sortOrder: this.sortOrder ?? 0,
      isActive: this.isActive ?? true,
    });
  }
}
