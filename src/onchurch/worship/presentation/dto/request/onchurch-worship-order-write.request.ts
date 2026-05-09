import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchWorshipOrderWriteCommand } from '@/onchurch/worship/application/command/onchurch-worship-write.command';

export class OnchurchWorshipOrderWriteRequest {
  @NotBlank()
  @MaxLength(16)
  @ApiProperty({ type: String, required: true, description: '순서 번호', example: '01' })
  no: string;

  @NotBlank()
  @MaxLength(120)
  @ApiProperty({ type: String, required: true, description: '항목', example: '예배의 부름' })
  item: string;

  @IsOptional()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, description: '담당', nullable: true, example: '사회자' })
  leader: string | null;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchWorshipOrderWriteCommand {
    return new OnchurchWorshipOrderWriteCommand({
      no: this.no.trim(),
      item: this.item.trim(),
      leader: (this.leader ?? '').trim() || null,
      sortOrder: this.sortOrder ?? 0,
      isActive: !!this.isActive,
    });
  }
}
