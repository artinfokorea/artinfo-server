import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchHistoryWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';

export class OnchurchHistoryWriteRequest {
  @NotBlank()
  @MaxLength(16)
  @ApiProperty({ type: String, required: true, description: '연도', example: '1979' })
  year: string;

  @NotBlank()
  @MaxLength(200)
  @ApiProperty({ type: String, required: true, description: '제목', example: '성동교회 설립' })
  title: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '설명', nullable: true })
  description: string | null;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  toCommand(): OnchurchHistoryWriteCommand {
    return new OnchurchHistoryWriteCommand({
      year: this.year.trim(),
      title: this.title.trim(),
      description: this.description ?? null,
      sortOrder: this.sortOrder ?? 0,
    });
  }
}
