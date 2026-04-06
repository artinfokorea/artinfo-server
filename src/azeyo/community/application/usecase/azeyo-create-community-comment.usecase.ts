import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';
import { AZEYO_NOTIFICATION_SENDER, IAzeyoNotificationSender } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoCommunityWriteBanned } from '@/azeyo/community/domain/exception/azeyo-community.exception';

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
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,
  ) {}

  async execute(params: { userId: number; postId: number; parentId: number | null; contents: string }): Promise<number> {
    const user = await this.userRepository.findOneOrThrowById(params.userId);
    if (user.isWriteBanned) throw new AzeyoCommunityWriteBanned();

    const comment = await this.commentRepository.create({
      userId: params.userId,
      postId: params.postId,
      parentId: params.parentId,
      contents: params.contents,
    });
    await this.activityPointsService.addPoints(params.userId, AZEYO_ACTIVITY_ACTION.CREATE_COMMENT);

    const post = await this.postRepository.findOneByIdOrThrow(params.postId);
    const notifiedUserIds = new Set<number>([params.userId]);

    // 1. 글 작성자에게 댓글 알림
    if (!notifiedUserIds.has(post.userId)) {
      await this.notificationSender.send({
        userId: post.userId,
        type: AZEYO_NOTIFICATION_TYPE.COMMENT,
        title: '새 댓글',
        body: `회원님의 '${post.title}' 글에 댓글이 달렸어요`,
        referenceId: String(params.postId),
      });
      notifiedUserIds.add(post.userId);
    }

    // 2. 대댓글인 경우: 부모 댓글 작성자에게 답글 알림
    if (params.parentId) {
      const parentComment = await this.commentRepository.findOneById(params.parentId);
      if (parentComment && !notifiedUserIds.has(parentComment.userId)) {
        await this.notificationSender.send({
          userId: parentComment.userId,
          type: AZEYO_NOTIFICATION_TYPE.COMMENT,
          title: '새 답글',
          body: `회원님의 댓글에 답글이 달렸어요`,
          referenceId: String(params.postId),
        });
        notifiedUserIds.add(parentComment.userId);
      }
    }

    // 3. @멘션된 유저에게 알림
    const mentions = params.contents.match(/@(\S+)/g);
    if (mentions) {
      const nicknames = mentions.map(m => m.slice(1));
      for (const nickname of nicknames) {
        const mentionedUser = await this.userRepository.findOneByNickname(nickname);
        if (mentionedUser && !notifiedUserIds.has(mentionedUser.id)) {
          await this.notificationSender.send({
            userId: mentionedUser.id,
            type: AZEYO_NOTIFICATION_TYPE.MENTION,
            title: '멘션',
            body: `${user.nickname}님이 댓글에서 회원님을 언급했어요`,
            referenceId: String(params.postId),
          });
          notifiedUserIds.add(mentionedUser.id);
        }
      }
    }

    return comment.id;
  }
}
