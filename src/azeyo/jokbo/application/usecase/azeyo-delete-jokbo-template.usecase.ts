import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

@Injectable()
export class AzeyoDeleteJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IAzeyoJokboTemplateRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(templateId: number, userId: number): Promise<void> {
    const template = await this.templateRepository.findOneByIdAndUserIdOrThrow(templateId, userId);
    await this.templateRepository.softRemove(template);
    await this.activityPointsService.removePoints(userId, AZEYO_ACTIVITY_ACTION.CREATE_JOKBO);
  }
}
