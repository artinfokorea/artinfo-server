import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_TAG_REPOSITORY, IAzeyoScheduleTagRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';
import { AzeyoScheduleTag } from '@/azeyo/schedule/domain/entity/azeyo-schedule-tag.entity';

@Injectable()
export class AzeyoScanScheduleTagsUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_TAG_REPOSITORY) private readonly tagRepository: IAzeyoScheduleTagRepository,
  ) {}

  async execute(userId: number): Promise<AzeyoScheduleTag[]> {
    return this.tagRepository.findSystemAndUserTags(userId);
  }
}
