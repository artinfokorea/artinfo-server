import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_TAG_REPOSITORY, IAzeyoScheduleTagRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';

@Injectable()
export class AzeyoCreateScheduleTagUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_TAG_REPOSITORY) private readonly tagRepository: IAzeyoScheduleTagRepository,
  ) {}

  async execute(userId: number, name: string, color: string): Promise<number> {
    const tag = await this.tagRepository.create({
      name,
      color,
      isSystem: false,
      userId,
    });
    return tag.id;
  }
}
