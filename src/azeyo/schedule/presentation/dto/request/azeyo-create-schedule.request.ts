import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';
import { AzeyoCreateScheduleCommand } from '@/azeyo/schedule/application/command/azeyo-create-schedule.command';

export class AzeyoCreateScheduleRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '일정 이름' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '날짜 (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ type: String, required: false, description: '메모' })
  memo: string | null;

  @ApiProperty({ type: [Number], required: false, description: '태그 ID 목록' })
  tagIds: number[];

  toCommand(userId: number) {
    return new AzeyoCreateScheduleCommand({
      userId,
      title: this.title,
      date: this.date,
      memo: this.memo ?? null,
      tagIds: this.tagIds ?? [],
    });
  }
}
