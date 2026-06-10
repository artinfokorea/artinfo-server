import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchChurchManagerResolver, OnchurchChurchRole } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';

@Injectable()
export class OnchurchScanMyChurchUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number): Promise<{ church: OnchurchChurch | null; user: OnchurchUser; churchRole: OnchurchChurchRole | null }> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) {
      const me = await this.userRepository.findOneOrThrowById(userId);
      return { church: null, user: me, churchRole: null };
    }
    // 구독 상태는 교회 소유자(오너)의 user 레코드 기준으로 표시한다.
    const owner = await this.userRepository.findOneOrThrowById(church.ownerId);
    const churchRole: OnchurchChurchRole = church.ownerId === userId ? 'owner' : 'admin';
    return { church, user: owner, churchRole };
  }
}
