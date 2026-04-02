import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_JOKBO_CATEGORY } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';

@Injectable()
export class AzeyoEditJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IAzeyoJokboTemplateRepository,
  ) {}

  async execute(params: { templateId: number; userId: number; category: AZEYO_JOKBO_CATEGORY; title: string; content: string }): Promise<void> {
    const template = await this.templateRepository.findOneByIdAndUserIdOrThrow(params.templateId, params.userId);
    template.category = params.category;
    template.title = params.title;
    template.content = params.content;
    await this.templateRepository.saveEntity(template);
  }
}
