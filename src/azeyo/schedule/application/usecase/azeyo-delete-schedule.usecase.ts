import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

@Injectable()
export class AzeyoDeleteScheduleUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_REPOSITORY) private readonly scheduleRepository: IAzeyoScheduleRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE) private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(scheduleId: number, userId: number): Promise<void> {
    const schedule = await this.scheduleRepository.findOneByIdAndUserIdOrThrow(scheduleId, userId);
    await this.scheduleRepository.softRemove(schedule);
    await this.activityPointsService.removePoints(userId, AZEYO_ACTIVITY_ACTION.CREATE_SCHEDULE);
  }
}
