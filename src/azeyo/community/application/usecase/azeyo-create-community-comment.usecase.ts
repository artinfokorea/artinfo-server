import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';

@Injectable()
export class AzeyoCreateCommunityCommentUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY)
    private readonly commentRepository: IAzeyoCommunityCommentRepository,
  ) {}

  async execute(params: { userId: number; postId: number; parentId: number | null; contents: string }): Promise<number> {
    const comment = await this.commentRepository.create({
      userId: params.userId,
      postId: params.postId,
      parentId: params.parentId,
      contents: params.contents,
    });
    return comment.id;
  }
}
