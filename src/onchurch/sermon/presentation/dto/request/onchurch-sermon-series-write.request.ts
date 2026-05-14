import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchSermonSeriesWriteCommand } from '@/onchurch/sermon/application/command/onchurch-sermon-write.command';

export class OnchurchSermonSeriesWriteRequest {
  @NotBlank()
  @MaxLength(120)
  @ApiProperty({ type: String, required: true, description: '카테고리 이름', example: '마태복음 강해' })
  name: string;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchSermonSeriesWriteCommand {
    return new OnchurchSermonSeriesWriteCommand({
      name: this.name.trim(),
      sortOrder: this.sortOrder ?? 0,
      isActive: !!this.isActive,
    });
  }
}
