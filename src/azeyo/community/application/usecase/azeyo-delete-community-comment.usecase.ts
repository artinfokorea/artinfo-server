import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';

@Injectable()
export class AzeyoDeleteCommunityCommentUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY)
    private readonly commentRepository: IAzeyoCommunityCommentRepository,
  ) {}

  async execute(commentId: number, userId: number): Promise<void> {
    await this.commentRepository.deleteWithChildren(commentId, userId);
  }
}
