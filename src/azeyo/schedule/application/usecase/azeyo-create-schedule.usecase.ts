import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AZEYO_SCHEDULE_TAG_REPOSITORY, IAzeyoScheduleTagRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';
import { AzeyoCreateScheduleCommand } from '@/azeyo/schedule/application/command/azeyo-create-schedule.command';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';
import { AZEYO_SCHEDULE_CALENDAR_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
import KoreanLunarCalendar from 'korean-lunar-calendar';

@Injectable()
export class AzeyoCreateScheduleUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_REPOSITORY) private readonly scheduleRepository: IAzeyoScheduleRepository,
    @Inject(AZEYO_SCHEDULE_TAG_REPOSITORY) private readonly tagRepository: IAzeyoScheduleTagRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE) private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(command: AzeyoCreateScheduleCommand): Promise<number> {
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

    const tags = await this.tagRepository.findByIds(command.tagIds);
    const schedule = await this.scheduleRepository.create({
      userId: command.userId,
      title: command.title,
      date,
      memo: command.memo,
      repeatType: command.repeatType,
      calendarType: command.calendarType,
      startDate,
      alarmTimes: command.alarmTimes,
      tags,
    });
    await this.activityPointsService.addPoints(command.userId, AZEYO_ACTIVITY_ACTION.CREATE_SCHEDULE);
    return schedule.id;
  }
}
