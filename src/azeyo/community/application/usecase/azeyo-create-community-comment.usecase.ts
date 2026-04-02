import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

@Injectable()
export class AzeyoCreateCommunityCommentUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY)
    private readonly commentRepository: IAzeyoCommunityCommentRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
  ) {}

  async execute(params: { userId: number; postId: number; parentId: number | null; contents: string }): Promise<number> {
    const comment = await this.commentRepository.create({
      userId: params.userId,
      postId: params.postId,
      parentId: params.parentId,
      contents: params.contents,
    });
    await this.activityPointsService.addPoints(params.userId, AZEYO_ACTIVITY_ACTION.CREATE_COMMENT);
    return comment.id;
  }
}
