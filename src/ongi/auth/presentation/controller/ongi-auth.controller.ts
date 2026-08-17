import { Body } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { OngiSnsLoginUseCase } from '@/ongi/auth/application/usecase/ongi-sns-login.usecase';
import { OngiRefreshTokensUseCase } from '@/ongi/auth/application/usecase/ongi-refresh-tokens.usecase';
import { OngiSnsLoginRequest } from '@/ongi/auth/presentation/dto/request/ongi-sns-login.request';
import { OngiRefreshTokensRequest } from '@/ongi/auth/presentation/dto/request/ongi-refresh-tokens.request';
import { OngiAuthTokensResponse, OngiLoginResponse } from '@/ongi/auth/presentation/dto/response/ongi-auth.response';

@RestApiController('/ongi/auths', 'Ongi Auth')
export class OngiAuthController {
  constructor(
    private readonly snsLoginUseCase: OngiSnsLoginUseCase,
    private readonly refreshTokensUseCase: OngiRefreshTokensUseCase,
  ) {}

  @RestApiPost(OngiLoginResponse, { path: '/login', description: '온기 소셜 로그인 (미가입 시 자동 가입)' })
  async login(@Body() request: OngiSnsLoginRequest) {
    const result = await this.snsLoginUseCase.execute(request.provider, request.token?.trim() || null, request.name?.trim() || null);

    return new OngiLoginResponse(result.user, result.auth);
  }

  @RestApiPost(OngiAuthTokensResponse, { path: '/refresh', description: '온기 토큰 재발급' })
  async refreshTokens(@Body() request: OngiRefreshTokensRequest) {
    const auth = await this.refreshTokensUseCase.execute(request.accessToken, request.refreshToken);

    return new OngiAuthTokensResponse(auth);
  }
}
