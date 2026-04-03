import { AZEYO_SCHEDULE_REPEAT_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';

export class AzeyoCreateScheduleCommand {
  userId: number;
  title: string;
  date: string;
  memo: string | null;
  tagIds: number[];
  repeatType: AZEYO_SCHEDULE_REPEAT_TYPE;
  startDate: string | null;

  constructor(params: {
    userId: number;
    title: string;
    date: string;
    memo: string | null;
    tagIds: number[];
    repeatType: AZEYO_SCHEDULE_REPEAT_TYPE;
    startDate: string | null;
  }) {
    Object.assign(this, params);
  }
}
