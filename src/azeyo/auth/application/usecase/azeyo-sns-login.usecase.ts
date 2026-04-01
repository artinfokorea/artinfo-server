import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AZEYO_AUTH_REPOSITORY, IAzeyoAuthRepository } from '@/azeyo/auth/domain/repository/azeyo-auth.repository.interface';
import { AZEYO_SNS_CLIENT, IAzeyoSnsClient } from '@/azeyo/sns/domain/service/azeyo-sns-client.interface';
import { AzeyoAuth, AZEYO_AUTH_TYPE, AZEYO_SNS_TYPE } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AzeyoUserNotRegistered } from '@/azeyo/auth/domain/exception/azeyo-auth.exception';

@Injectable()
export class AzeyoSnsLoginUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,

    @Inject(AZEYO_AUTH_REPOSITORY)
    private readonly authRepository: IAzeyoAuthRepository,

    @Inject(AZEYO_SNS_CLIENT)
    private readonly snsClient: IAzeyoSnsClient,
  ) {}

  async execute(token: string, type: AZEYO_SNS_TYPE): Promise<AzeyoAuth> {
    const snsUserInfo = await this.snsClient.getUserInfo(token, type);

    const user = await this.userRepository.findBySnsId(type, snsUserInfo.snsId);
    if (!user) {
      throw new AzeyoUserNotRegistered();
    }

    return await this.authRepository.create(
      { type: type as unknown as AZEYO_AUTH_TYPE, userId: user.id },
      user,
    );
  }
}
