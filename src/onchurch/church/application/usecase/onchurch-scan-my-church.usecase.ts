import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

@Injectable()
export class OnchurchScanMyChurchUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
  ) {}

  async execute(userId: number): Promise<{ church: OnchurchChurch | null; user: OnchurchUser }> {
    const [church, user] = await Promise.all([
      this.churchRepository.findByOwnerId(userId),
      this.userRepository.findOneOrThrowById(userId),
    ]);
    return { church, user };
  }
}
