import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_COMMUNITY_POST_REPOSITORY,
  IOnchurchCommunityPostRepository,
} from '@/onchurch/community/domain/repository/onchurch-community-post.repository.interface';
import { OnchurchCommunityPost } from '@/onchurch/community/domain/entity/onchurch-community-post.entity';
import { OnchurchCommunityPostWriteCommand } from '@/onchurch/community/application/command/onchurch-community-post-write.command';
import { OnchurchCommunityChurchResolver } from '@/onchurch/community/application/usecase/onchurch-community-post-church-resolver.service';

@Injectable()
export class OnchurchUpdateMyCommunityPostUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IOnchurchCommunityPostRepository,
    private readonly resolver: OnchurchCommunityChurchResolver,
  ) {}

  async execute(userId: number, id: number, command: OnchurchCommunityPostWriteCommand): Promise<OnchurchCommunityPost> {
    const { user, churchId } = await this.resolver.resolve(userId);
    return this.postRepository.updateOwn(churchId, id, user.id, {
      category: command.category,
      title: command.title,
      content: command.content,
      photoUrls: command.photoUrls,
      videoUrl: command.videoUrl,
    });
  }
}
