import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_COMMUNITY_POST_REPOSITORY,
  IOnchurchCommunityPostRepository,
} from '@/onchurch/community/domain/repository/onchurch-community-post.repository.interface';
import { OnchurchCommunityChurchResolver } from '@/onchurch/community/application/usecase/onchurch-community-post-church-resolver.service';

@Injectable()
export class OnchurchDeleteMyCommunityPostUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IOnchurchCommunityPostRepository,
    private readonly resolver: OnchurchCommunityChurchResolver,
  ) {}

  async execute(userId: number, id: number): Promise<void> {
    const { user, churchId } = await this.resolver.resolve(userId);
    await this.postRepository.removeOwn(churchId, id, user.id);
  }
}
