import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AzeyoCommunityComment } from '@/azeyo/community/domain/entity/azeyo-community-comment.entity';

@Injectable()
export class AzeyoScanCommunityCommentsUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY)
    private readonly commentRepository: IAzeyoCommunityCommentRepository,
  ) {}

  async execute(postId: number, params: { parentId: number | null; page: number; size: number }): Promise<{ items: AzeyoCommunityComment[]; totalCount: number }> {
    const skip = (params.page - 1) * params.size;
    return this.commentRepository.findByPostId(postId, { parentId: params.parentId, skip, take: params.size });
  }
}
