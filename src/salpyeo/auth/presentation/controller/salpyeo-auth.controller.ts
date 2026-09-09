import { Body } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { SalpyeoSnsLoginUseCase } from '@/salpyeo/auth/application/usecase/salpyeo-sns-login.usecase';
import { SalpyeoRefreshTokensUseCase } from '@/salpyeo/auth/application/usecase/salpyeo-refresh-tokens.usecase';
import { SalpyeoSnsLoginRequest } from '@/salpyeo/auth/presentation/dto/request/salpyeo-sns-login.request';
import { SalpyeoRefreshTokensRequest } from '@/salpyeo/auth/presentation/dto/request/salpyeo-refresh-tokens.request';
import { SalpyeoAuthTokensResponse, SalpyeoLoginResponse } from '@/salpyeo/auth/presentation/dto/response/salpyeo-auth.response';

@RestApiController('/salpyeo/auths', 'Salpyeo Auth')
export class SalpyeoAuthController {
  constructor(
    private readonly snsLoginUseCase: SalpyeoSnsLoginUseCase,
    private readonly refreshTokensUseCase: SalpyeoRefreshTokensUseCase,
  ) {}

  @RestApiPost(SalpyeoLoginResponse, { path: '/login', description: '살펴 구글 로그인 (미가입 시 자동 가입)' })
  async login(@Body() request: SalpyeoSnsLoginRequest) {
    const result = await this.snsLoginUseCase.execute(request.provider, request.token.trim());

    return new SalpyeoLoginResponse(result.user, result.auth);
  }

  @RestApiPost(SalpyeoAuthTokensResponse, { path: '/refresh', description: '살펴 토큰 재발급' })
  async refreshTokens(@Body() request: SalpyeoRefreshTokensRequest) {
    const auth = await this.refreshTokensUseCase.execute(request.accessToken, request.refreshToken);

    return new SalpyeoAuthTokensResponse(auth);
  }
}
