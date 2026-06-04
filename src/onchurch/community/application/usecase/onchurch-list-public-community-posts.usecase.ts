import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_COMMUNITY_POST_REPOSITORY,
  IOnchurchCommunityPostRepository,
} from '@/onchurch/community/domain/repository/onchurch-community-post.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchCommunityPost } from '@/onchurch/community/domain/entity/onchurch-community-post.entity';

@Injectable()
export class OnchurchListPublicCommunityPostsUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IOnchurchCommunityPostRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(
    slug: string,
    params: { category?: string; page: number; size: number },
  ): Promise<{ items: OnchurchCommunityPost[]; totalCount: number }> {
    const church = await this.churchRepository.findBySlug(slug);
    if (!church) return { items: [], totalCount: 0 };
    const skip = Math.max(0, (params.page - 1) * params.size);
    const take = Math.min(100, Math.max(1, params.size));
    return this.postRepository.findVisiblePagedByChurchId(church.id, { category: params.category, skip, take });
  }
}
