import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AZEYO_AUTH_REPOSITORY, IAzeyoAuthRepository } from '@/azeyo/auth/domain/repository/azeyo-auth.repository.interface';
import { AZEYO_SNS_CLIENT, IAzeyoSnsClient } from '@/azeyo/sns/domain/service/azeyo-sns-client.interface';
import { AzeyoAuth, AZEYO_AUTH_TYPE, AZEYO_SNS_TYPE } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AzeyoUserNotRegistered, AzeyoMaleOnlyService } from '@/azeyo/auth/domain/exception/azeyo-auth.exception';

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

  async execute(_token: string, _type: AZEYO_SNS_TYPE): Promise<AzeyoAuth> {
    // 남성만 가입/로그인 가능 (테스트: 모든 유저 차단)
    throw new AzeyoMaleOnlyService();
  }
}
