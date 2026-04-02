import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_LIKE_REPOSITORY, IAzeyoCommunityLikeRepository } from '@/azeyo/community/domain/repository/azeyo-community-like.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

@Injectable()
export class AzeyoLikeCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoCommunityLikeRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE) private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(userId: number, postId: number, isLike: boolean): Promise<void> {
    const post = await this.postRepository.findOneByIdOrThrow(postId);
    const like = await this.likeRepository.findByTargetIdAndUserId(postId, userId);

    if (!isLike && like) {
      await this.likeRepository.softRemove(like);
    } else if (isLike && !like) {
      await this.likeRepository.save({ userId, targetId: postId });
      await this.activityPointsService.addPoints(userId, AZEYO_ACTIVITY_ACTION.GIVE_LIKE);
      if (post.userId !== userId) {
        await this.activityPointsService.addPoints(post.userId, AZEYO_ACTIVITY_ACTION.RECEIVE_LIKE);
      }
    }
  }
}
