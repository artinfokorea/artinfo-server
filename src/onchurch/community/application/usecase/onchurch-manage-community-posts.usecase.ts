import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_COMMUNITY_POST_REPOSITORY,
  IOnchurchCommunityPostRepository,
} from '@/onchurch/community/domain/repository/onchurch-community-post.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchCommunityPost } from '@/onchurch/community/domain/entity/onchurch-community-post.entity';
import { OnchurchCommunityChurchNotConfigured } from '@/onchurch/community/domain/exception/onchurch-community.exception';

@Injectable()
export class OnchurchListManageCommunityPostsUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IOnchurchCommunityPostRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchCommunityPost[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.postRepository.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchSetHiddenCommunityPostUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IOnchurchCommunityPostRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, isHidden: boolean): Promise<OnchurchCommunityPost> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchCommunityChurchNotConfigured();
    return this.postRepository.setHidden(church.id, id, isHidden);
  }
}

@Injectable()
export class OnchurchDeleteManageCommunityPostUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IOnchurchCommunityPostRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchCommunityChurchNotConfigured();
    await this.postRepository.removeByChurch(church.id, id);
  }
}
