import { Inject, Injectable, Logger } from '@nestjs/common';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY, IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';
import { AZEYO_NOTIFICATION_SENDER, IAzeyoNotificationSender } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { SystemService } from '@/system/service/system.service';
import { ALIMTALK_TEMPLATE } from '@/azeyo/notification/domain/constant/alimtalk-template.constant';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { AZEYO_NOTIFICATION_SETTING_REPOSITORY, IAzeyoNotificationSettingRepository } from '@/azeyo/notification/domain/repository/azeyo-notification-setting.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoAlimtalkHistory } from '@/azeyo/notification/domain/entity/azeyo-alimtalk-history.entity';

const ALIMTALK_COOLDOWN_SECONDS = 3600; // 1시간

@Injectable()
export class AzeyoCopyJokboTemplateUseCase {
  private readonly logger = new Logger(AzeyoCopyJokboTemplateUseCase.name);

  constructor(
    @Inject(AZEYO_JOKBO_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IAzeyoJokboTemplateRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
    @Inject(AZEYO_NOTIFICATION_SENDER)
    private readonly notificationSender: IAzeyoNotificationSender,
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,
    private readonly systemService: SystemService,
    private readonly redisRepository: RedisRepository,
    @Inject(AZEYO_NOTIFICATION_SETTING_REPOSITORY)
    private readonly settingRepository: IAzeyoNotificationSettingRepository,
    @InjectRepository(AzeyoAlimtalkHistory)
    private readonly alimtalkHistoryRepository: Repository<AzeyoAlimtalkHistory>,
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

    try {
      const setting = await this.settingRepository.findByUserId(template.userId);
      if (!setting?.jokboCopyEnabled) return;

      const cooldownKey = `alimtalk:jokbo_copy:${template.userId}:${templateId}`;
      const existing = await this.redisRepository.getByKey(cooldownKey);
      if (existing) return;

      const user = await this.userRepository.findOneOrThrowById(template.userId);
      if (user.phone) {
        const variables = { '#{jokboTitle}': template.title };
        try {
          await this.systemService.sendAlimtalk(user.phone, ALIMTALK_TEMPLATE.JOKBO_COPY, variables);
          await this.alimtalkHistoryRepository.save({ userId: template.userId, phone: user.phone, templateId: ALIMTALK_TEMPLATE.JOKBO_COPY, variables, isSuccess: true, errorMessage: null });
          await this.redisRepository.setValue({ key: cooldownKey, value: true, ttl: ALIMTALK_COOLDOWN_SECONDS });
        } catch (sendError) {
          await this.alimtalkHistoryRepository.save({ userId: template.userId, phone: user.phone, templateId: ALIMTALK_TEMPLATE.JOKBO_COPY, variables, isSuccess: false, errorMessage: String(sendError) });
          throw sendError;
        }
      }
    } catch (e) {
      this.logger.error(`알림톡 발송 실패 - templateId: ${templateId}`, e);
    }
  }
}
