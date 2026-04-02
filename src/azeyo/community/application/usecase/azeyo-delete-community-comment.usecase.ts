import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

@Injectable()
export class AzeyoDeleteCommunityCommentUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY)
    private readonly commentRepository: IAzeyoCommunityCommentRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(commentId: number, userId: number): Promise<void> {
    await this.commentRepository.deleteWithChildren(commentId, userId);
    await this.activityPointsService.removePoints(userId, AZEYO_ACTIVITY_ACTION.CREATE_COMMENT);
  }
}
