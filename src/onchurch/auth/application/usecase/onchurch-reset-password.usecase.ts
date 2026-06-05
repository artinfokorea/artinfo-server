import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchAccountNotMatched, OnchurchPhoneNotVerified } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Injectable()
export class OnchurchResetPasswordUseCase {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    private readonly redisRepository: RedisRepository,
  ) {}

  async execute(params: { loginId: string; phone: string; newPassword: string }): Promise<void> {
    // 아이디 + 연락처로 휴대폰 인증(verifications/mobile)을 통과해야 한다.
    const verifiedKey = `onchurch:verified:${params.phone}`;
    const isPhoneVerified = await this.redisRepository.getByKey(verifiedKey);
    if (!isPhoneVerified) throw new OnchurchPhoneNotVerified();

    const user = await this.userRepository.findByLoginId(params.loginId);
    if (!user || user.phone !== params.phone) {
      throw new OnchurchAccountNotMatched();
    }

    user.password = await bcrypt.hash(params.newPassword, this.BCRYPT_ROUNDS);
    await this.userRepository.saveEntity(user);

    // 인증 플래그는 1회성으로 소비한다.
    await this.redisRepository.delete(verifiedKey);
  }
}
