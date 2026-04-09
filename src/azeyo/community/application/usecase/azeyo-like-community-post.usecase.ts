import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_LIKE_REPOSITORY, IAzeyoCommunityLikeRepository } from '@/azeyo/community/domain/repository/azeyo-community-like.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';
import { AZEYO_NOTIFICATION_SENDER, IAzeyoNotificationSender } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AZEYO_NOTIFICATION_SETTING_REPOSITORY, IAzeyoNotificationSettingRepository } from '@/azeyo/notification/domain/repository/azeyo-notification-setting.repository.interface';
import { SystemService } from '@/system/service/system.service';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { AzeyoAlimtalkHistory } from '@/azeyo/notification/domain/entity/azeyo-alimtalk-history.entity';
import { ALIMTALK_TEMPLATE } from '@/azeyo/notification/domain/constant/alimtalk-template.constant';

const ALIMTALK_COOLDOWN_SECONDS = 3600;

@Injectable()
export class AzeyoLikeCommunityPostUseCase {
  private readonly logger = new Logger(AzeyoLikeCommunityPostUseCase.name);

  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoCommunityLikeRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE) private readonly activityPointsService: IAzeyoActivityPointsService,
    @Inject(AZEYO_NOTIFICATION_SENDER) private readonly notificationSender: IAzeyoNotificationSender,
    @Inject(AZEYO_USER_REPOSITORY) private readonly userRepository: IAzeyoUserRepository,
    @Inject(AZEYO_NOTIFICATION_SETTING_REPOSITORY) private readonly settingRepository: IAzeyoNotificationSettingRepository,
    private readonly systemService: SystemService,
    private readonly redisRepository: RedisRepository,
    @InjectRepository(AzeyoAlimtalkHistory) private readonly alimtalkHistoryRepository: Repository<AzeyoAlimtalkHistory>,
  ) {}

  async execute(userId: number, postId: number, isLike: boolean): Promise<void> {
    const post = await this.postRepository.findOneByIdOrThrow(postId);
    const like = await this.likeRepository.findByTargetIdAndUserId(postId, userId);

    if (!isLike && like) {
      await this.likeRepository.softRemove(like);
      await this.activityPointsService.removePoints(userId, AZEYO_ACTIVITY_ACTION.GIVE_LIKE);
      if (post.userId !== userId) {
        await this.activityPointsService.removePoints(post.userId, AZEYO_ACTIVITY_ACTION.RECEIVE_LIKE);
      }
    } else if (isLike && !like) {
      await this.likeRepository.save({ userId, targetId: postId });
      await this.activityPointsService.addPoints(userId, AZEYO_ACTIVITY_ACTION.GIVE_LIKE);
      if (post.userId !== userId) {
        await this.activityPointsService.addPoints(post.userId, AZEYO_ACTIVITY_ACTION.RECEIVE_LIKE);
        await this.notificationSender.send({
          userId: post.userId,
          type: AZEYO_NOTIFICATION_TYPE.LIKE,
          title: '좋아요',
          body: `회원님의 '${post.title}' 글에 좋아요가 달렸어요`,
          referenceId: String(postId),
        });
        await this.sendAlimtalk(post.userId, postId, post.title);
      }
    }
  }

  private async sendAlimtalk(targetUserId: number, postId: number, postTitle: string): Promise<void> {
    try {
      const setting = await this.settingRepository.findByUserId(targetUserId);
      if (!setting?.likeEnabled) return;

      const cooldownKey = `alimtalk:like:${targetUserId}:${postId}`;
      const existing = await this.redisRepository.getByKey(cooldownKey);
      if (existing) return;

      const user = await this.userRepository.findOneOrThrowById(targetUserId);
      if (user.phone) {
        const variables = { '#{postTitle}': postTitle, '#{postId}': String(postId) };
        try {
          await this.systemService.sendAlimtalk(user.phone, ALIMTALK_TEMPLATE.LIKE, variables);
          await this.alimtalkHistoryRepository.save({ userId: targetUserId, phone: user.phone, templateId: ALIMTALK_TEMPLATE.LIKE, variables, isSuccess: true, errorMessage: null });
          await this.redisRepository.setValue({ key: cooldownKey, value: true, ttl: ALIMTALK_COOLDOWN_SECONDS });
        } catch (sendError) {
          await this.alimtalkHistoryRepository.save({ userId: targetUserId, phone: user.phone, templateId: ALIMTALK_TEMPLATE.LIKE, variables, isSuccess: false, errorMessage: String(sendError) });
        }
      }
    } catch (e) {
      this.logger.error(`알림톡 발송 실패 - like postId: ${postId}`, e);
    }
  }
}
