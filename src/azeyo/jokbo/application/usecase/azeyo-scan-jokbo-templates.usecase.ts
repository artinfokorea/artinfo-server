import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_JOKBO_LIKE_REPOSITORY, IAzeyoJokboLikeRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-like.repository.interface';
import { AzeyoJokboTemplate, AZEYO_JOKBO_CATEGORY } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';

@Injectable()
export class AzeyoScanJokboTemplatesUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY) private readonly templateRepository: IAzeyoJokboTemplateRepository,
    @Inject(AZEYO_JOKBO_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoJokboLikeRepository,
  ) {}

  async execute(params: {
    userId: number | null;
    page: number;
    size: number;
    category: AZEYO_JOKBO_CATEGORY | null;
  }): Promise<{ items: AzeyoJokboTemplate[]; totalCount: number }> {
    const skip = (params.page - 1) * params.size;
    const result = await this.templateRepository.findManyPaging({
      skip,
      take: params.size,
      category: params.category,
    });

    const templateIds = result.items.map(item => item.id);
    if (templateIds.length === 0) return result;

    const likeCounts = await this.likeRepository.countByTemplateIds(templateIds);
    const likeMap = new Map(likeCounts.map(r => [r.templateId, Number(r.count)]));

    result.items.forEach(item => {
      item.likesCount = likeMap.get(item.id) ?? 0;
    });

    // Sort by likes desc (frontend expects likeCount sorting)
    result.items.sort((a, b) => b.likesCount - a.likesCount);

    if (params.userId) {
      const likes = await this.likeRepository.findManyByTemplateIdsAndUserId(templateIds, params.userId);
      const likedSet = new Set(likes.map(l => l.templateId));
      result.items.forEach(item => {
        if (likedSet.has(item.id)) item.isLiked = true;
      });
    }

    return result;
  }
}
