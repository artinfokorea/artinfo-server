import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AzeyoCreateJokboTemplateCommand } from '@/azeyo/jokbo/application/command/azeyo-create-jokbo-template.command';

@Injectable()
export class AzeyoCreateJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IAzeyoJokboTemplateRepository,
  ) {}

  async execute(command: AzeyoCreateJokboTemplateCommand): Promise<number> {
    const template = await this.templateRepository.create({
      userId: command.userId,
      category: command.category,
      title: command.title,
      content: command.content,
    });
    return template.id;
  }
}
