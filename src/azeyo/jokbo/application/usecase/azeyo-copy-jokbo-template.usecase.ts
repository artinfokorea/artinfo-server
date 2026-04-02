import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';
import { AZEYO_NOTIFICATION_SENDER, IAzeyoNotificationSender } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';

@Injectable()
export class AzeyoCopyJokboTemplateUseCase {
  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IAzeyoJokboTemplateRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
    @Inject(AZEYO_NOTIFICATION_SENDER)
    private readonly notificationSender: IAzeyoNotificationSender,
  ) {}

  async execute(templateId: number): Promise<void> {
    const template = await this.templateRepository.findOneByIdOrThrow(templateId);
    await this.templateRepository.incrementCopyCount(templateId);
    await this.activityPointsService.addPoints(template.userId, AZEYO_ACTIVITY_ACTION.JOKBO_COPIED);
    await this.notificationSender.send({
      userId: template.userId,
      type: AZEYO_NOTIFICATION_TYPE.JOKBO_COPY,
      title: '족보 복사',
      body: `회원님의 '${template.title}' 족보가 복사되었어요`,
      referenceId: String(templateId),
    });
  }
}
