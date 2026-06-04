import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchCommunityChurchNotConfigured } from '@/onchurch/community/domain/exception/onchurch-community.exception';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

/**
 * 로그인 사용자가 글을 쓸 교회를 결정한다.
 * - 성도(MEMBER): user.churchId (교회 페이지에서 가입 시 세팅됨)
 * - 교회 소유자(운영자): churchId가 없으면 본인이 소유한 교회로 폴백
 */
@Injectable()
export class OnchurchCommunityChurchResolver {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async resolve(userId: number): Promise<{ user: OnchurchUser; churchId: number }> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.churchId) return { user, churchId: user.churchId };

    const owned = await this.churchRepository.findByOwnerId(userId);
    if (owned) return { user, churchId: owned.id };

    throw new OnchurchCommunityChurchNotConfigured();
  }
}
