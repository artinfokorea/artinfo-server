import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';
import { AzeyoCreateScheduleCommand } from '@/azeyo/schedule/application/command/azeyo-create-schedule.command';
import { AZEYO_SCHEDULE_REPEAT_TYPE, AZEYO_SCHEDULE_CALENDAR_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';

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

  @ApiProperty({ enum: AZEYO_SCHEDULE_REPEAT_TYPE, required: false, description: '반복 설정 (NONE / YEARLY)' })
  repeatType: AZEYO_SCHEDULE_REPEAT_TYPE;

  @ApiProperty({ enum: AZEYO_SCHEDULE_CALENDAR_TYPE, required: false, description: '달력 유형 (SOLAR / LUNAR)', default: 'SOLAR' })
  calendarType: AZEYO_SCHEDULE_CALENDAR_TYPE;

  @ApiProperty({ type: String, required: false, description: '최초 시작일 (YYYY-MM-DD), 반복 시 몇 주년 계산용' })
  startDate: string | null;

  @ApiProperty({ type: [String], required: false, description: '알람 시간 목록 (최대 2개, HH:mm 형식)', example: ['09:00', '18:00'] })
  alarmTimes: string[] | null;

  toCommand(userId: number) {
    return new AzeyoCreateScheduleCommand({
      userId,
      title: this.title,
      date: this.date,
      memo: this.memo ?? null,
      tagIds: this.tagIds ?? [],
      repeatType: this.repeatType ?? AZEYO_SCHEDULE_REPEAT_TYPE.NONE,
      calendarType: this.calendarType ?? AZEYO_SCHEDULE_CALENDAR_TYPE.SOLAR,
      startDate: this.startDate ?? null,
      alarmTimes: this.alarmTimes?.slice(0, 2) ?? null,
    });
  }
}
