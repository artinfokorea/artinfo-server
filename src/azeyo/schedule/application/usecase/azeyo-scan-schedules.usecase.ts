import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AzeyoSchedule, AZEYO_SCHEDULE_REPEAT_TYPE, AZEYO_SCHEDULE_CALENDAR_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const KoreanLunarCalendar = require('korean-lunar-calendar');

@Injectable()
export class AzeyoScanSchedulesUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_REPOSITORY) private readonly scheduleRepository: IAzeyoScheduleRepository,
  ) {}

  async execute(userId: number): Promise<AzeyoSchedule[]> {
    const schedules = await this.scheduleRepository.findManyByUserId(userId);

    const now = new Date();
    const thisYear = now.getFullYear();

    return schedules.map(schedule => {
      if (schedule.repeatType === AZEYO_SCHEDULE_REPEAT_TYPE.YEARLY && schedule.startDate) {
        if (schedule.calendarType === AZEYO_SCHEDULE_CALENDAR_TYPE.LUNAR) {
          // 음력: startDate에 저장된 음력 월/일을 올해 양력으로 변환
          const orig = new Date(schedule.startDate);
          const lunarMonth = orig.getMonth() + 1;
          const lunarDay = orig.getDate();

          const nextDate = this.lunarToSolarForNextOccurrence(lunarMonth, lunarDay, thisYear, now);
          schedule.date = nextDate;
        } else {
          // 양력: 기존 로직
          const orig = new Date(schedule.date);
          const month = orig.getMonth();
          const day = orig.getDate();

          const thisYearDate = new Date(thisYear, month, day);
          const nextDate = thisYearDate.getTime() < now.getTime() - 86400000
            ? new Date(thisYear + 1, month, day)
            : thisYearDate;

          schedule.date = nextDate.toISOString().split('T')[0];
        }
      }
      return schedule;
    });
  }

  private lunarToSolarForNextOccurrence(lunarMonth: number, lunarDay: number, thisYear: number, now: Date): string {
    const calendar = new KoreanLunarCalendar();

    // 올해 음력 날짜를 양력으로 변환 시도
    const validThisYear = calendar.setLunarDate(thisYear, lunarMonth, lunarDay, false);
    if (validThisYear) {
      const solar = calendar.getSolarCalendar();
      const thisYearDate = new Date(solar.year, solar.month - 1, solar.day);

      if (thisYearDate.getTime() >= now.getTime() - 86400000) {
        return thisYearDate.toISOString().split('T')[0];
      }
    }

    // 올해 날짜가 지났거나 유효하지 않으면 내년으로
    const validNextYear = calendar.setLunarDate(thisYear + 1, lunarMonth, lunarDay, false);
    if (validNextYear) {
      const solar = calendar.getSolarCalendar();
      return `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`;
    }

    // 윤달 등으로 해당 날짜가 없으면 해당 월의 마지막 날로 폴백
    calendar.setLunarDate(thisYear + 1, lunarMonth, 1, false);
    const solar = calendar.getSolarCalendar();
    return `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`;
  }
}
