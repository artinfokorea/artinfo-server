import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchEventWriteCommand } from '@/onchurch/event/application/command/onchurch-event-write.command';

export class OnchurchEventWriteRequest {
  @NotBlank()
  @MaxLength(300)
  @ApiProperty({ type: String, required: true, description: '일정 제목' })
  title: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '상세 설명', nullable: true })
  description: string | null;

  @IsOptional()
  @MaxLength(200)
  @ApiProperty({ type: String, required: false, description: '장소', nullable: true })
  location: string | null;

  @IsISO8601()
  @ApiProperty({ type: String, required: true, description: '시작 시각 (ISO8601)', example: '2026-04-05T11:00:00+09:00' })
  startAt: string;

  @IsOptional()
  @IsISO8601()
  @ApiProperty({ type: String, required: false, description: '종료 시각 (ISO8601)', nullable: true })
  endAt: string | null;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '종일 일정 여부' })
  isAllDay: boolean;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '활성 여부' })
  isActive: boolean;

  toCommand(): OnchurchEventWriteCommand {
    return new OnchurchEventWriteCommand({
      title: this.title.trim(),
      description: this.description ?? null,
      location: (this.location ?? '').trim() || null,
      startAt: new Date(this.startAt),
      endAt: this.endAt ? new Date(this.endAt) : null,
      isAllDay: !!this.isAllDay,
      isActive: !!this.isActive,
    });
  }
}
