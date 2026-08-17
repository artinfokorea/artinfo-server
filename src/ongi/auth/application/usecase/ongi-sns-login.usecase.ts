import { Inject, Injectable } from '@nestjs/common';
import { IOngiUserRepository, ONGI_USER_REPOSITORY } from '@/ongi/user/domain/repository/ongi-user.repository.interface';
import { IOngiAuthRepository, ONGI_AUTH_REPOSITORY } from '@/ongi/auth/domain/repository/ongi-auth.repository.interface';
import { IOngiSnsClient, ONGI_SNS_CLIENT, OngiSnsUserInfo } from '@/ongi/auth/domain/service/ongi-sns-client.interface';
import { OngiAuth } from '@/ongi/auth/domain/entity/ongi-auth.entity';
import { ONGI_SNS_TYPE, OngiUser } from '@/ongi/user/domain/entity/ongi-user.entity';
import { OngiSnsTokenRequired } from '@/ongi/auth/domain/exception/ongi-auth.exception';

export interface OngiLoginResult {
  user: OngiUser;
  auth: OngiAuth;
}

/**
 * 온기 소셜 로그인 — 가입돼 있지 않으면 자동 가입 후 로그인합니다.
 *
 * 앱에 SNS SDK(OAuth) 연동이 붙기 전까지는 token 없이 호출하는 개발용 로그인을 허용합니다.
 * 운영 환경에서는 ONGI_ALLOW_DEV_LOGIN=true 가 아닌 한 token 이 필수입니다.
 */
@Injectable()
export class OngiSnsLoginUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,

    @Inject(ONGI_AUTH_REPOSITORY)
    private readonly authRepository: IOngiAuthRepository,

    @Inject(ONGI_SNS_CLIENT)
    private readonly snsClient: IOngiSnsClient,
  ) {}

  async execute(type: ONGI_SNS_TYPE, token: string | null, name: string | null): Promise<OngiLoginResult> {
    const snsUserInfo = await this.resolveSnsUserInfo(type, token);

    let user = await this.userRepository.findBySnsId(type, snsUserInfo.snsId);
    if (!user) {
      user = await this.userRepository.create({
        name: name || snsUserInfo.name || '온기 사용자',
        snsType: type,
        snsId: snsUserInfo.snsId,
        iconImageUrl: snsUserInfo.iconImageUrl,
        email: snsUserInfo.email,
      });
    }

    const auth = await this.authRepository.create({ type, userId: user.id }, user);

    return { user, auth };
  }

  private async resolveSnsUserInfo(type: ONGI_SNS_TYPE, token: string | null): Promise<OngiSnsUserInfo> {
    if (token) {
      return this.snsClient.getUserInfo(token, type);
    }

    const allowDevLogin = process.env['NODE_ENV'] !== 'production' || process.env['ONGI_ALLOW_DEV_LOGIN'] === 'true';
    if (!allowDevLogin) throw new OngiSnsTokenRequired();

    return { snsId: `dev-${type}`, name: null, email: null, iconImageUrl: null };
  }
}
