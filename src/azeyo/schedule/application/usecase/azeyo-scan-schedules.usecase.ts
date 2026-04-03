import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AzeyoSchedule, AZEYO_SCHEDULE_REPEAT_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';

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
        const orig = new Date(schedule.date);
        const month = orig.getMonth();
        const day = orig.getDate();

        // 올해 날짜가 이미 지났으면 내년으로
        const thisYearDate = new Date(thisYear, month, day);
        const nextDate = thisYearDate.getTime() < now.getTime() - 86400000
          ? new Date(thisYear + 1, month, day)
          : thisYearDate;

        schedule.date = nextDate.toISOString().split('T')[0];
      }
      return schedule;
    });
  }
}
