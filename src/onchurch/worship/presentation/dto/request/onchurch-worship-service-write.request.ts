import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchWorshipServiceTag } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import { OnchurchWorshipServiceWriteCommand } from '@/onchurch/worship/application/command/onchurch-worship-write.command';

const TAGS: OnchurchWorshipServiceTag[] = ['MAIN', 'WEEK', 'DAILY'];

export class OnchurchWorshipServiceWriteRequest {
  @IsIn(TAGS)
  @ApiProperty({ enum: TAGS, required: true, description: '예배 구분', example: 'MAIN' })
  tag: OnchurchWorshipServiceTag;

  @NotBlank()
  @MaxLength(120)
  @ApiProperty({ type: String, required: true, description: '예배 이름', example: '주일 1부 예배' })
  name: string;

  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '시간', example: '오전 09:00' })
  time: string;

  @IsOptional()
  @MaxLength(200)
  @ApiProperty({ type: String, required: false, description: '부가 정보', nullable: true, example: '본당 · 1시간 30분' })
  meta: string | null;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '대표 예배 여부', example: false })
  isFeatured: boolean;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchWorshipServiceWriteCommand {
    return new OnchurchWorshipServiceWriteCommand({
      tag: this.tag,
      name: this.name.trim(),
      time: this.time.trim(),
      meta: (this.meta ?? '').trim() || null,
      isFeatured: !!this.isFeatured,
      sortOrder: this.sortOrder ?? 0,
      isActive: !!this.isActive,
    });
  }
}
