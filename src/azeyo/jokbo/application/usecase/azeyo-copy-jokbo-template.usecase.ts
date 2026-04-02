import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';

@Injectable()
export class AzeyoCopyJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IAzeyoJokboTemplateRepository,
  ) {}

  async execute(templateId: number): Promise<void> {
    await this.templateRepository.findOneByIdOrThrow(templateId);
    await this.templateRepository.incrementCopyCount(templateId);
  }
}
