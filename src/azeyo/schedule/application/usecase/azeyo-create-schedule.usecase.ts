import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AZEYO_SCHEDULE_TAG_REPOSITORY, IAzeyoScheduleTagRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';
import { AzeyoCreateScheduleCommand } from '@/azeyo/schedule/application/command/azeyo-create-schedule.command';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

@Injectable()
export class AzeyoCreateScheduleUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_REPOSITORY) private readonly scheduleRepository: IAzeyoScheduleRepository,
    @Inject(AZEYO_SCHEDULE_TAG_REPOSITORY) private readonly tagRepository: IAzeyoScheduleTagRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE) private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(command: AzeyoCreateScheduleCommand): Promise<number> {
    const tags = await this.tagRepository.findByIds(command.tagIds);
    const schedule = await this.scheduleRepository.create({
      userId: command.userId,
      title: command.title,
      date: command.date,
      memo: command.memo,
      repeatType: command.repeatType,
      calendarType: command.calendarType,
      startDate: command.startDate,
      alarmTimes: command.alarmTimes,
      tags,
    });
    await this.activityPointsService.addPoints(command.userId, AZEYO_ACTIVITY_ACTION.CREATE_SCHEDULE);
    return schedule.id;
  }
}
