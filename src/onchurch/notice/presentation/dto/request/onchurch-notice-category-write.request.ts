import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchNoticeCategoryWriteCommand } from '@/onchurch/notice/application/command/onchurch-notice-category-write.command';

export class OnchurchNoticeCategoryWriteRequest {
  @NotBlank()
  @MaxLength(120)
  @ApiProperty({ type: String, required: true, description: '카테고리 이름', example: '행사' })
  name: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ type: Number, required: false, description: '정렬 순서' })
  sortOrder?: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchNoticeCategoryWriteCommand {
    return new OnchurchNoticeCategoryWriteCommand({
      name: this.name.trim(),
      sortOrder: this.sortOrder ?? 0,
      isActive: !!this.isActive,
    });
  }
}
