import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { SignUpRequest } from '@/auth/dto/request/sign-up.request';
import { AuthService } from '@/auth/service/auth.service';
import { OkResponse } from '@/common/response/ok.response';
import { Body } from '@nestjs/common';
import { EmailLoginRequest } from '@/auth/dto/request/email-login-request';
import { AuthTokensResponse } from '@/auth/dto/response/auth-tokens.response';
import { SnsLoginRequest } from '@/auth/dto/request/sns-login-request';
import { RefreshTokensRequest } from '@/auth/dto/request/refresh-tokens.request';

@RestApiController('/auths', 'Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RestApiPost(OkResponse, { path: '/sign-up', description: '회원 가입' })
  async signup(@Body() request: SignUpRequest) {
    await this.authService.signup(request.toCommand());
  }

  @RestApiPost(AuthTokensResponse, { path: '/refresh', description: '토큰 재발급' })
  async refreshTokens(@Body() request: RefreshTokensRequest) {
    const auth = await this.authService.refreshTokens({ accessToken: request.accessToken, refreshToken: request.refreshToken });

    return new AuthTokensResponse(auth);
  }

  @RestApiPost(AuthTokensResponse, { path: '/login/email', description: '이메일 로그인' })
  async loginByEmail(@Body() request: EmailLoginRequest) {
    const auth = await this.authService.loginByEmail(request.toCommand());

    return new AuthTokensResponse(auth);
  }

  @RestApiPost(AuthTokensResponse, { path: '/login/sns', description: '소셜 로그인' })
  async loginBySnS(@Body() request: SnsLoginRequest) {
    const auth = await this.authService.loginBySns(request.token, request.type);

    return new AuthTokensResponse(auth);
  }
}
