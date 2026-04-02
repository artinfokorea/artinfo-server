import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AZEYO_AUTH_REPOSITORY, IAzeyoAuthRepository } from '@/azeyo/auth/domain/repository/azeyo-auth.repository.interface';
import { AZEYO_SNS_CLIENT, IAzeyoSnsClient } from '@/azeyo/sns/domain/service/azeyo-sns-client.interface';
import { AzeyoAuth, AZEYO_AUTH_TYPE, AZEYO_SNS_TYPE } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AzeyoSignupCommand } from '@/azeyo/auth/application/command/azeyo-signup.command';
import { AzeyoNicknameAlreadyExist } from '@/azeyo/user/domain/exception/azeyo-user.exception';

@Injectable()
export class AzeyoSignupUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,

    @Inject(AZEYO_AUTH_REPOSITORY)
    private readonly authRepository: IAzeyoAuthRepository,

    @Inject(AZEYO_SNS_CLIENT)
    private readonly snsClient: IAzeyoSnsClient,
  ) {}

  async execute(command: AzeyoSignupCommand): Promise<AzeyoAuth> {
    const nicknameExists = await this.userRepository.existsByNickname(command.nickname);
    if (nicknameExists) throw new AzeyoNicknameAlreadyExist();

    const snsUserInfo = await this.snsClient.getUserInfo(command.snsToken, command.snsType as AZEYO_SNS_TYPE);

    const existingUser = await this.userRepository.findBySnsId(command.snsType, snsUserInfo.snsId);
    if (existingUser) {
      return await this.authRepository.create(
        { type: command.snsType as AZEYO_AUTH_TYPE, userId: existingUser.id },
        existingUser,
      );
    }

    const randomProfileNumber = Math.floor(Math.random() * 12) + 1;
    const defaultIconUrl = `https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/${randomProfileNumber}.jpg`;

    const userId = await this.userRepository.create({
      nickname: command.nickname,
      marriageYear: command.marriageYear,
      children: command.children,
      email: snsUserInfo.email,
      snsType: command.snsType,
      snsId: snsUserInfo.snsId,
      iconImageUrl: snsUserInfo.iconImageUrl || defaultIconUrl,
    });

    const user = await this.userRepository.findOneOrThrowById(userId);

    return await this.authRepository.create(
      { type: command.snsType as AZEYO_AUTH_TYPE, userId: user.id },
      user,
    );
  }
}
