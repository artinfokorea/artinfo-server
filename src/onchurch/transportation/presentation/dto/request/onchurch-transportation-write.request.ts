import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchTransportationWriteCommand } from '@/onchurch/transportation/application/command/onchurch-transportation-write.command';

export class OnchurchTransportationWriteRequest {
  @IsOptional()
  @MaxLength(32)
  @ApiProperty({ type: String, required: false, description: '아이콘 (이모지 등)', nullable: true, example: '🚇' })
  icon: string | null;

  @NotBlank()
  @MaxLength(60)
  @ApiProperty({ type: String, required: true, description: '구분 태그', example: '지하철' })
  tag: string;

  @NotBlank()
  @MaxLength(200)
  @ApiProperty({ type: String, required: true, description: '제목', example: '왕십리역 5번 출구' })
  title: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '설명', nullable: true })
  description: string | null;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서', example: 0 })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부', example: true })
  isActive: boolean;

  toCommand(): OnchurchTransportationWriteCommand {
    return new OnchurchTransportationWriteCommand({
      icon: (this.icon ?? null) || null,
      tag: this.tag,
      title: this.title,
      description: this.description ?? null,
      sortOrder: this.sortOrder ?? 0,
      isActive: this.isActive ?? true,
    });
  }
}
