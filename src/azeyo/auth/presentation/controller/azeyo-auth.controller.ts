import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { Body } from '@nestjs/common';
import { AzeyoSignupUseCase } from '@/azeyo/auth/application/usecase/azeyo-signup.usecase';
import { AzeyoSnsLoginUseCase } from '@/azeyo/auth/application/usecase/azeyo-sns-login.usecase';
import { AzeyoRefreshTokensUseCase } from '@/azeyo/auth/application/usecase/azeyo-refresh-tokens.usecase';
import { AzeyoSignupRequest } from '@/azeyo/auth/presentation/dto/request/azeyo-signup.request';
import { AzeyoSnsLoginRequest } from '@/azeyo/auth/presentation/dto/request/azeyo-sns-login.request';
import { AzeyoRefreshTokensRequest } from '@/azeyo/auth/presentation/dto/request/azeyo-refresh-tokens.request';
import { AzeyoAuthTokensResponse } from '@/azeyo/auth/presentation/dto/response/azeyo-auth-tokens.response';

@RestApiController('/azeyo/auths', 'Azeyo Auth')
export class AzeyoAuthController {
  constructor(
    private readonly signupUseCase: AzeyoSignupUseCase,
    private readonly snsLoginUseCase: AzeyoSnsLoginUseCase,
    private readonly refreshTokensUseCase: AzeyoRefreshTokensUseCase,
  ) {}

  @RestApiPost(AzeyoAuthTokensResponse, { path: '/sign-up', description: '아재요 회원가입 (SNS + 프로필 정보)' })
  async signup(@Body() request: AzeyoSignupRequest) {
    const auth = await this.signupUseCase.execute(request.toCommand());

    return new AzeyoAuthTokensResponse(auth);
  }

  @RestApiPost(AzeyoAuthTokensResponse, { path: '/login/sns', description: '아재요 소셜 로그인' })
  async loginBySns(@Body() request: AzeyoSnsLoginRequest) {
    const auth = await this.snsLoginUseCase.execute(request.token, request.type);

    return new AzeyoAuthTokensResponse(auth);
  }

  @RestApiPost(AzeyoAuthTokensResponse, { path: '/refresh', description: '아재요 토큰 재발급' })
  async refreshTokens(@Body() request: AzeyoRefreshTokensRequest) {
    const auth = await this.refreshTokensUseCase.execute(request.accessToken, request.refreshToken);

    return new AzeyoAuthTokensResponse(auth);
  }
}
