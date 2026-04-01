import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AzeyoCreateCommunityPostCommand } from '@/azeyo/community/application/command/azeyo-create-community-post.command';

@Injectable()
export class AzeyoCreateCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
  ) {}

  async execute(command: AzeyoCreateCommunityPostCommand): Promise<number> {
    const post = await this.postRepository.create({
      userId: command.userId,
      type: command.type,
      category: command.category,
      title: command.title,
      contents: command.contents,
      imageUrls: command.imageUrls,
      imageRatio: command.imageRatio,
      voteOptionA: command.voteOptionA,
      voteOptionB: command.voteOptionB,
    });
    return post.id;
  }
}
