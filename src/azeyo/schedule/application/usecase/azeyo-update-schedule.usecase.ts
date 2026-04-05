import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AZEYO_SCHEDULE_TAG_REPOSITORY, IAzeyoScheduleTagRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';
import { AzeyoCreateScheduleCommand } from '@/azeyo/schedule/application/command/azeyo-create-schedule.command';

@Injectable()
export class AzeyoUpdateScheduleUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_REPOSITORY) private readonly scheduleRepository: IAzeyoScheduleRepository,
    @Inject(AZEYO_SCHEDULE_TAG_REPOSITORY) private readonly tagRepository: IAzeyoScheduleTagRepository,
  ) {}

  async execute(scheduleId: number, command: AzeyoCreateScheduleCommand): Promise<void> {
    const schedule = await this.scheduleRepository.findOneByIdAndUserIdOrThrow(scheduleId, command.userId);
    const tags = await this.tagRepository.findByIds(command.tagIds);

    schedule.title = command.title;
    schedule.date = command.date;
    schedule.memo = command.memo;
    schedule.repeatType = command.repeatType;
    schedule.calendarType = command.calendarType;
    schedule.startDate = command.startDate;
    schedule.alarmTimes = command.alarmTimes;
    schedule.tags = tags;

    await this.scheduleRepository.save(schedule);
  }
}
