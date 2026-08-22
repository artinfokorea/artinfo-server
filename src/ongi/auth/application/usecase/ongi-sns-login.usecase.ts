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
 * token 없이 호출하는 개발용 로그인(`dev-{provider}` 계정)은 로컬 .env 에 ONGI_DEV_LOGIN=true 를 명시한 경우에만 허용합니다.
 * 기본값은 "차단" — NODE_ENV 가 잘못 설정된 배포 환경에서도 열리지 않도록 opt-in 으로 둡니다 (배포 워크플로는 이 변수를 주입하지 않음).
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

    if (process.env['ONGI_DEV_LOGIN'] !== 'true') throw new OngiSnsTokenRequired();

    return { snsId: `dev-${type}`, name: null, email: null, iconImageUrl: null };
  }
}
