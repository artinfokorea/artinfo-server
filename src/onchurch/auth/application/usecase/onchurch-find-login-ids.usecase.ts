import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchLoginIdNotFoundByPhone, OnchurchPhoneNotVerified } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { RedisRepository } from '@/common/redis/redis-repository.service';

export interface OnchurchFoundLoginId {
  loginId: string;
  name: string;
  createdAt: Date;
}

@Injectable()
export class OnchurchFindLoginIdsUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    private readonly redisRepository: RedisRepository,
  ) {}

  async execute(phone: string): Promise<OnchurchFoundLoginId[]> {
    // 휴대폰 인증(verifications/mobile)을 먼저 통과해야 한다.
    const verifiedKey = `onchurch:verified:${phone}`;
    const isPhoneVerified = await this.redisRepository.getByKey(verifiedKey);
    if (!isPhoneVerified) throw new OnchurchPhoneNotVerified();

    const users = await this.userRepository.findByPhone(phone);
    if (users.length === 0) {
      await this.redisRepository.delete(verifiedKey);
      throw new OnchurchLoginIdNotFoundByPhone();
    }

    // 인증 플래그는 1회성으로 소비한다.
    await this.redisRepository.delete(verifiedKey);

    // 연락처 중복이 있을 수 있으므로 해당 연락처의 모든 아이디를 반환한다.
    return users.map((user) => ({
      loginId: user.loginId,
      name: user.name,
      createdAt: user.createdAt,
    }));
  }
}
