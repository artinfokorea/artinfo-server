import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AzeyoCreateJokboTemplateCommand } from '@/azeyo/jokbo/application/command/azeyo-create-jokbo-template.command';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

@Injectable()
export class AzeyoCreateJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IAzeyoJokboTemplateRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(command: AzeyoCreateJokboTemplateCommand): Promise<number> {
    const template = await this.templateRepository.create({
      userId: command.userId,
      category: command.category,
      title: command.title,
      content: command.content,
    });
    await this.activityPointsService.addPoints(command.userId, AZEYO_ACTIVITY_ACTION.CREATE_JOKBO);
    return template.id;
  }
}
