import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

@Injectable()
export class AzeyoRemoveCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(userId: number, postId: number): Promise<void> {
    const post = await this.postRepository.findOneByIdAndUserIdOrThrow(postId, userId);
    await this.postRepository.softRemove(post);
    await this.activityPointsService.removePoints(userId, AZEYO_ACTIVITY_ACTION.CREATE_POST);
  }
}
