import { Inject, Injectable } from '@nestjs/common';
import { ISalpyeoUserRepository, SALPYEO_USER_REPOSITORY } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { ISalpyeoAuthRepository, SALPYEO_AUTH_REPOSITORY } from '@/salpyeo/auth/domain/repository/salpyeo-auth.repository.interface';
import { SalpyeoAuth } from '@/salpyeo/auth/domain/entity/salpyeo-auth.entity';
import { SalpyeoFailedToRenewToken } from '@/salpyeo/auth/domain/exception/salpyeo-auth.exception';
import { SalpyeoTokenIssuer } from '@/salpyeo/auth/infrastructure/service/salpyeo-token.issuer';

/** refresh token 만료가 이 시간보다 가까우면 refresh token 도 함께 새로 발급한다 */
const REFRESH_ROTATE_THRESHOLD_SECONDS = 60 * 60;

@Injectable()
export class SalpyeoRefreshTokensUseCase {
  constructor(
    @Inject(SALPYEO_USER_REPOSITORY)
    private readonly userRepository: ISalpyeoUserRepository,

    @Inject(SALPYEO_AUTH_REPOSITORY)
    private readonly authRepository: ISalpyeoAuthRepository,

    private readonly tokenIssuer: SalpyeoTokenIssuer,
  ) {}

  async execute(accessToken: string, refreshToken: string): Promise<SalpyeoAuth> {
    let exp: number;
    try {
      ({ exp } = this.tokenIssuer.verifyRefreshToken(refreshToken));
    } catch {
      throw new SalpyeoFailedToRenewToken();
    }

    // 만료된 access token 도 갱신 대상이라 verify 가 아니라 decode 로 사용자만 읽는다
    const decoded = this.tokenIssuer.decodeAccessToken(accessToken);
    if (!decoded?.id) throw new SalpyeoFailedToRenewToken();

    const user = await this.userRepository.findOneOrThrowById(decoded.id);

    const remainingSeconds = exp - Math.floor(Date.now() / 1000);

    return remainingSeconds < REFRESH_ROTATE_THRESHOLD_SECONDS
      ? this.authRepository.renewTokens(user, accessToken, refreshToken)
      : this.authRepository.renewAccessToken(user, accessToken, refreshToken);
  }
}
