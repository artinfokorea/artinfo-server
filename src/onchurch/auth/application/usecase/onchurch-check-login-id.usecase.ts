import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';

@Injectable()
export class OnchurchCheckLoginIdUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
  ) {}

  // 사용 가능하면 true, 이미 존재하면 false.
  async execute(loginId: string): Promise<boolean> {
    const exists = await this.userRepository.existsByLoginId(loginId.trim());
    return !exists;
  }
}
