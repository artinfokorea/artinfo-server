import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';
import { AZEYO_NOTIFICATION_SENDER, IAzeyoNotificationSender } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';

@Injectable()
export class AzeyoCreateCommunityCommentUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY)
    private readonly commentRepository: IAzeyoCommunityCommentRepository,
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
    @Inject(AZEYO_NOTIFICATION_SENDER)
    private readonly notificationSender: IAzeyoNotificationSender,
  ) {}

  async execute(params: { userId: number; postId: number; parentId: number | null; contents: string }): Promise<number> {
    const comment = await this.commentRepository.create({
      userId: params.userId,
      postId: params.postId,
      parentId: params.parentId,
      contents: params.contents,
    });
    await this.activityPointsService.addPoints(params.userId, AZEYO_ACTIVITY_ACTION.CREATE_COMMENT);

    // 글 작성자에게 알림
    const post = await this.postRepository.findOneByIdOrThrow(params.postId);
    if (post.userId !== params.userId) {
      await this.notificationSender.send({
        userId: post.userId,
        type: AZEYO_NOTIFICATION_TYPE.COMMENT,
        title: '새 댓글',
        body: `회원님의 '${post.title}' 글에 댓글이 달렸어요`,
        referenceId: String(params.postId),
      });
    }

    return comment.id;
  }
}
