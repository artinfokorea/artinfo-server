import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_LIKE_REPOSITORY, IAzeyoCommunityLikeRepository } from '@/azeyo/community/domain/repository/azeyo-community-like.repository.interface';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

@Injectable()
export class AzeyoScanUserProfileUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY) private readonly userRepository: IAzeyoUserRepository,
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoCommunityLikeRepository,
  ) {}

  async execute(userId: number): Promise<AzeyoUser> {
    const user = await this.userRepository.findOneOrThrowById(userId);

    const [postsCount, postIds] = await Promise.all([
      this.postRepository.countByUserId(userId),
      this.postRepository.findIdsByUserId(userId),
    ]);

    user.postsCount = postsCount;

    if (postIds.length > 0) {
      const likeCounts = await this.likeRepository.countByTargetIds(postIds);
      user.likesCount = likeCounts.reduce((sum, r) => sum + Number(r.count), 0);
    }

    return user;
  }
}
