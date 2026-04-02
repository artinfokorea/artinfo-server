import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AZEYO_SCHEDULE_TAG_REPOSITORY, IAzeyoScheduleTagRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';
import { AzeyoCreateScheduleCommand } from '@/azeyo/schedule/application/command/azeyo-create-schedule.command';

@Injectable()
export class AzeyoCreateScheduleUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_REPOSITORY) private readonly scheduleRepository: IAzeyoScheduleRepository,
    @Inject(AZEYO_SCHEDULE_TAG_REPOSITORY) private readonly tagRepository: IAzeyoScheduleTagRepository,
  ) {}

  async execute(command: AzeyoCreateScheduleCommand): Promise<number> {
    const tags = await this.tagRepository.findByIds(command.tagIds);
    const schedule = await this.scheduleRepository.create({
      userId: command.userId,
      title: command.title,
      date: command.date,
      memo: command.memo,
      tags,
    });
    return schedule.id;
  }
}
