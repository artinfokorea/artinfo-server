import { AZEYO_SCHEDULE_REPEAT_TYPE, AZEYO_SCHEDULE_CALENDAR_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';

export class AzeyoCreateScheduleCommand {
  userId: number;
  title: string;
  date: string;
  memo: string | null;
  tagIds: number[];
  repeatType: AZEYO_SCHEDULE_REPEAT_TYPE;
  calendarType: AZEYO_SCHEDULE_CALENDAR_TYPE;
  startDate: string | null;

  constructor(params: {
    userId: number;
    title: string;
    date: string;
    memo: string | null;
    tagIds: number[];
    repeatType: AZEYO_SCHEDULE_REPEAT_TYPE;
    calendarType: AZEYO_SCHEDULE_CALENDAR_TYPE;
    startDate: string | null;
  }) {
    Object.assign(this, params);
  }
}
