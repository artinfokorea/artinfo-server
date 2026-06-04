import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchUserPasswordMismatch } from '@/onchurch/user/domain/exception/onchurch-user.exception';
import { OnchurchPhoneNotVerified } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Injectable()
export class OnchurchGetMyProfileUseCase {
  constructor(@Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository) {}
  async execute(userId: number): Promise<OnchurchUser> {
    return this.userRepository.findOneOrThrowById(userId);
  }
}

@Injectable()
export class OnchurchUpdateMyProfileUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    private readonly redisRepository: RedisRepository,
  ) {}
  async execute(userId: number, params: { name: string; phone: string }): Promise<OnchurchUser> {
    const user = await this.userRepository.findOneOrThrowById(userId);

    // 휴대폰 번호가 바뀌면 가입과 동일하게 휴대폰 인증을 요구한다.
    if (params.phone !== user.phone) {
      const verifiedKey = `onchurch:verified:${params.phone}`;
      const isVerified = await this.redisRepository.getByKey(verifiedKey);
      if (!isVerified) throw new OnchurchPhoneNotVerified();
      await this.redisRepository.delete(verifiedKey);
    }

    user.name = params.name;
    user.phone = params.phone;
    await this.userRepository.saveEntity(user);
    return user;
  }
}

@Injectable()
export class OnchurchChangeMyPasswordUseCase {
  private readonly BCRYPT_ROUNDS = 10;
  constructor(@Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository) {}
  async execute(userId: number, params: { currentPassword: string; newPassword: string }): Promise<void> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    const matches = await bcrypt.compare(params.currentPassword, user.password);
    if (!matches) throw new OnchurchUserPasswordMismatch();
    user.password = await bcrypt.hash(params.newPassword, this.BCRYPT_ROUNDS);
    await this.userRepository.saveEntity(user);
  }
}
