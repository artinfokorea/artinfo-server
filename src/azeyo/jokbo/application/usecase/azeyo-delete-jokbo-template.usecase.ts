import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';

@Injectable()
export class AzeyoDeleteJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IAzeyoJokboTemplateRepository,
  ) {}

  async execute(templateId: number, userId: number): Promise<void> {
    const template = await this.templateRepository.findOneByIdAndUserIdOrThrow(templateId, userId);
    await this.templateRepository.softRemove(template);
  }
}
