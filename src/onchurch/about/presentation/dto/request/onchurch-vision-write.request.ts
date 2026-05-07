import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchVisionWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';

export class OnchurchVisionWriteRequest {
  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '한글 키워드', example: '예배하는' })
  ko: string;

  @IsOptional()
  @MaxLength(80)
  @ApiProperty({ type: String, required: false, description: '영문 키워드', nullable: true, example: 'WORSHIP' })
  en: string | null;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '설명', nullable: true })
  description: string | null;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchVisionWriteCommand {
    return new OnchurchVisionWriteCommand({
      ko: this.ko.trim(),
      en: (this.en ?? '').trim() || null,
      description: this.description ?? null,
      sortOrder: this.sortOrder ?? 0,
      isActive: !!this.isActive,
    });
  }
}
