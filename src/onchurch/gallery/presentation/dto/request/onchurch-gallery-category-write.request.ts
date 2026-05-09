import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchGalleryCategoryWriteCommand } from '@/onchurch/gallery/application/command/onchurch-gallery-write.command';

export class OnchurchGalleryCategoryWriteRequest {
  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '카테고리 이름', example: '예배' })
  name: string;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchGalleryCategoryWriteCommand {
    return new OnchurchGalleryCategoryWriteCommand({
      name: this.name.trim(),
      sortOrder: this.sortOrder ?? 0,
      isActive: !!this.isActive,
    });
  }
}
