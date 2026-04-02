import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';

@Injectable()
export class AzeyoDeleteScheduleUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_REPOSITORY) private readonly scheduleRepository: IAzeyoScheduleRepository,
  ) {}

  async execute(scheduleId: number, userId: number): Promise<void> {
    const schedule = await this.scheduleRepository.findOneByIdAndUserIdOrThrow(scheduleId, userId);
    await this.scheduleRepository.softRemove(schedule);
  }
}
