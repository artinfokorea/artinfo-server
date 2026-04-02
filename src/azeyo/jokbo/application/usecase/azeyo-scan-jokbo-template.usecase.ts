import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_JOKBO_LIKE_REPOSITORY, IAzeyoJokboLikeRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-like.repository.interface';
import { AzeyoJokboTemplate } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';

@Injectable()
export class AzeyoScanJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY) private readonly templateRepository: IAzeyoJokboTemplateRepository,
    @Inject(AZEYO_JOKBO_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoJokboLikeRepository,
  ) {}

  async execute(templateId: number, userId: number | null): Promise<AzeyoJokboTemplate> {
    const template = await this.templateRepository.findOneByIdWithUserOrThrow(templateId);

    const likeCounts = await this.likeRepository.countByTemplateIds([templateId]);
    template.likesCount = likeCounts[0] ? Number(likeCounts[0].count) : 0;

    if (userId) {
      const likes = await this.likeRepository.findManyByTemplateIdsAndUserId([templateId], userId);
      template.isLiked = likes.length > 0;
    }

    return template;
  }
}
