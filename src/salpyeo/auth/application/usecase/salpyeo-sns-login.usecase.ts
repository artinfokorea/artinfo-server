import { Inject, Injectable } from '@nestjs/common';
import { ISalpyeoUserRepository, SALPYEO_USER_REPOSITORY } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { ISalpyeoAuthRepository, SALPYEO_AUTH_REPOSITORY } from '@/salpyeo/auth/domain/repository/salpyeo-auth.repository.interface';
import { ISalpyeoSnsClient, SALPYEO_SNS_CLIENT } from '@/salpyeo/auth/domain/service/salpyeo-sns-client.interface';
import { SalpyeoAuth } from '@/salpyeo/auth/domain/entity/salpyeo-auth.entity';
import { SALPYEO_SNS_TYPE, SalpyeoUser } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';

export interface SalpyeoLoginResult {
  user: SalpyeoUser;
  auth: SalpyeoAuth;
}

/** 구글이 이름을 주지 않았을 때 쓰는 기본 이름 */
export const SALPYEO_DEFAULT_USER_NAME = '살펴 사용자';

/**
 * 살펴 소셜 로그인 — 가입돼 있지 않으면 자동 가입 후 로그인한다.
 * 이미 가입된 사용자는 로그인할 때마다 구글 프로필(이름·이메일·사진)의 변경을 반영한다.
 */
@Injectable()
export class SalpyeoSnsLoginUseCase {
  constructor(
    @Inject(SALPYEO_USER_REPOSITORY)
    private readonly userRepository: ISalpyeoUserRepository,

    @Inject(SALPYEO_AUTH_REPOSITORY)
    private readonly authRepository: ISalpyeoAuthRepository,

    @Inject(SALPYEO_SNS_CLIENT)
    private readonly snsClient: ISalpyeoSnsClient,
  ) {}

  async execute(type: SALPYEO_SNS_TYPE, token: string): Promise<SalpyeoLoginResult> {
    const snsUserInfo = await this.snsClient.getUserInfo(token, type);
    const name = snsUserInfo.name || SALPYEO_DEFAULT_USER_NAME;

    const existing = await this.userRepository.findBySnsId(type, snsUserInfo.snsId);
    const user = existing
      ? await this.userRepository.updateProfile(existing.id, { name, email: snsUserInfo.email, iconImageUrl: snsUserInfo.iconImageUrl })
      : await this.userRepository.create({
          name,
          snsType: type,
          snsId: snsUserInfo.snsId,
          email: snsUserInfo.email,
          iconImageUrl: snsUserInfo.iconImageUrl,
        });

    const auth = await this.authRepository.create({ type, userId: user.id }, user);

    return { user, auth };
  }
}
