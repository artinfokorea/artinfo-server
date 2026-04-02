import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_JOKBO_LIKE_REPOSITORY, IAzeyoJokboLikeRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-like.repository.interface';
import { AzeyoJokboTemplate } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';

@Injectable()
export class AzeyoScanMyJokboTemplatesUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY) private readonly templateRepository: IAzeyoJokboTemplateRepository,
    @Inject(AZEYO_JOKBO_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoJokboLikeRepository,
  ) {}

  async execute(userId: number): Promise<AzeyoJokboTemplate[]> {
    const templates = await this.templateRepository.findManyByUserId(userId);

    const templateIds = templates.map(t => t.id);
    if (templateIds.length === 0) return templates;

    const likeCounts = await this.likeRepository.countByTemplateIds(templateIds);
    const likeMap = new Map(likeCounts.map(r => [r.templateId, Number(r.count)]));

    templates.forEach(t => {
      t.likesCount = likeMap.get(t.id) ?? 0;
    });

    return templates;
  }
}
