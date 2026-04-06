import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AZEYO_SCHEDULE_TAG_REPOSITORY, IAzeyoScheduleTagRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';
import { AzeyoCreateScheduleCommand } from '@/azeyo/schedule/application/command/azeyo-create-schedule.command';
import { AZEYO_SCHEDULE_CALENDAR_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
import KoreanLunarCalendar from 'korean-lunar-calendar';

@Injectable()
export class AzeyoUpdateScheduleUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_REPOSITORY) private readonly scheduleRepository: IAzeyoScheduleRepository,
    @Inject(AZEYO_SCHEDULE_TAG_REPOSITORY) private readonly tagRepository: IAzeyoScheduleTagRepository,
  ) {}

  async execute(scheduleId: number, command: AzeyoCreateScheduleCommand): Promise<void> {
    const schedule = await this.scheduleRepository.findOneByIdAndUserIdOrThrow(scheduleId, command.userId);
    const tags = await this.tagRepository.findByIds(command.tagIds);

    let date = command.date;
    let startDate = command.startDate;

    if (command.calendarType === AZEYO_SCHEDULE_CALENDAR_TYPE.LUNAR) {
      const [year, month, day] = command.date.split('-').map(Number);
      const cal = new KoreanLunarCalendar();
      cal.setLunarDate(year, month, day, false);
      const solar = cal.getSolarCalendar();
      startDate = command.date;
      date = `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`;
    }

    schedule.title = command.title;
    schedule.date = date;
    schedule.memo = command.memo;
    schedule.repeatType = command.repeatType;
    schedule.calendarType = command.calendarType;
    schedule.startDate = startDate;
    schedule.alarmTimes = command.alarmTimes;
    schedule.tags = tags;

    await this.scheduleRepository.save(schedule);
  }
}
