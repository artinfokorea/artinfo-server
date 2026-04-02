import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_JOKBO_LIKE_REPOSITORY, IAzeyoJokboLikeRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-like.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

@Injectable()
export class AzeyoLikeJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY) private readonly templateRepository: IAzeyoJokboTemplateRepository,
    @Inject(AZEYO_JOKBO_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoJokboLikeRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE) private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(userId: number, templateId: number, isLike: boolean): Promise<void> {
    const template = await this.templateRepository.findOneByIdOrThrow(templateId);
    const like = await this.likeRepository.findByTemplateIdAndUserId(templateId, userId);

    if (!isLike && like) {
      await this.likeRepository.softRemove(like);
    } else if (isLike && !like) {
      await this.likeRepository.save({ userId, templateId });
      await this.activityPointsService.addPoints(userId, AZEYO_ACTIVITY_ACTION.GIVE_LIKE);
      if (template.userId !== userId) {
        await this.activityPointsService.addPoints(template.userId, AZEYO_ACTIVITY_ACTION.RECEIVE_LIKE);
      }
    }
  }
}
