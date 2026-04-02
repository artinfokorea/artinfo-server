import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AzeyoSchedule } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';

@Injectable()
export class AzeyoScanSchedulesUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_REPOSITORY) private readonly scheduleRepository: IAzeyoScheduleRepository,
  ) {}

  async execute(userId: number): Promise<AzeyoSchedule[]> {
    return this.scheduleRepository.findManyByUserId(userId);
  }
}
