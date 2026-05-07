import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_AUTH_REPOSITORY, IOnchurchAuthRepository } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchSignupCommand } from '@/onchurch/auth/application/command/onchurch-signup.command';
import { OnchurchPhoneNotVerified, OnchurchUserIdAlreadyExist } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Injectable()
export class OnchurchSignupUseCase {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_AUTH_REPOSITORY)
    private readonly authRepository: IOnchurchAuthRepository,

    private readonly redisRepository: RedisRepository,
  ) {}

  async execute(command: OnchurchSignupCommand): Promise<OnchurchAuth> {
    const verifiedKey = `onchurch:verified:${command.phone}`;
    const isPhoneVerified = await this.redisRepository.getByKey(verifiedKey);
    if (!isPhoneVerified) throw new OnchurchPhoneNotVerified();

    const loginIdExists = await this.userRepository.existsByLoginId(command.userId);
    if (loginIdExists) throw new OnchurchUserIdAlreadyExist();

    const hashedPassword = await bcrypt.hash(command.password, this.BCRYPT_ROUNDS);

    const FREE_TRIAL_DAYS = 14;
    const freeTrialUntil = new Date(Date.now() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);

    const userId = await this.userRepository.create({
      loginId: command.userId,
      password: hashedPassword,
      name: command.name,
      phone: command.phone,
      role: ONCHURCH_USER_ROLE.MEMBER,
      churchName: null,
      churchId: null,
      marketingConsent: command.marketingConsent,
      freeTrialUntil,
    });

    const user = await this.userRepository.findOneOrThrowById(userId);

    await this.redisRepository.delete(verifiedKey);

    return await this.authRepository.create({ userId: user.id }, user);
  }
}
