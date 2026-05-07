import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_AUTH_REPOSITORY, IOnchurchAuthRepository } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { OnchurchLoginCommand } from '@/onchurch/auth/application/command/onchurch-login.command';
import { OnchurchInvalidCredentials } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';

@Injectable()
export class OnchurchLoginUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_AUTH_REPOSITORY)
    private readonly authRepository: IOnchurchAuthRepository,
  ) {}

  async execute(command: OnchurchLoginCommand): Promise<OnchurchAuth> {
    const user = await this.userRepository.findByLoginId(command.userId);
    if (!user) throw new OnchurchInvalidCredentials();

    const passwordMatches = await bcrypt.compare(command.password, user.password);
    if (!passwordMatches) throw new OnchurchInvalidCredentials();

    return await this.authRepository.create({ userId: user.id }, user);
  }
}
