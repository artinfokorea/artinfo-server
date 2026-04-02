import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_JOKBO_LIKE_REPOSITORY, IAzeyoJokboLikeRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-like.repository.interface';

@Injectable()
export class AzeyoLikeJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY) private readonly templateRepository: IAzeyoJokboTemplateRepository,
    @Inject(AZEYO_JOKBO_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoJokboLikeRepository,
  ) {}

  async execute(userId: number, templateId: number, isLike: boolean): Promise<void> {
    await this.templateRepository.findOneByIdOrThrow(templateId);
    const like = await this.likeRepository.findByTemplateIdAndUserId(templateId, userId);

    if (!isLike && like) {
      await this.likeRepository.softRemove(like);
    } else if (isLike && !like) {
      await this.likeRepository.save({ userId, templateId });
    }
  }
}
