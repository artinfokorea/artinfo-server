import { Body, Param, ParseEnumPipe } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { Holy365AuthUseCase } from '@/holy365/auth/application/holy365-auth.usecase';
import { HOLY365_SNS_PROVIDER } from '@/holy365/auth/domain/service/holy365-oauth';
import {
  Holy365AuthorizeUrlRequest,
  Holy365AuthorizeUrlResponse,
  Holy365LoginRequest,
  Holy365LoginResponse,
  Holy365RefreshRequest,
  Holy365SignupRequest,
  Holy365SnsLoginRequest,
  Holy365TokensResponse,
} from '@/holy365/auth/presentation/dto/holy365-auth.dto';

@RestApiController('/holy365/auths', 'Holy365 Auth')
export class Holy365AuthController {
  constructor(private readonly authUseCase: Holy365AuthUseCase) {}

  @RestApiPost(Holy365LoginResponse, { path: '/signup', description: '이메일 회원가입 (가입 즉시 로그인)' })
  async signup(@Body() request: Holy365SignupRequest) {
    const { user, auth } = await this.authUseCase.signup(request);

    return new Holy365LoginResponse(user, auth);
  }

  @RestApiPost(Holy365LoginResponse, { path: '/login', description: '이메일 로그인' })
  async login(@Body() request: Holy365LoginRequest) {
    const { user, auth } = await this.authUseCase.login(request);

    return new Holy365LoginResponse(user, auth);
  }

  @RestApiPost(Holy365AuthorizeUrlResponse, { path: '/sns/:provider/authorize-url', description: '소셜 로그인 화면 주소 (google · kakao · naver)' })
  async authorizeUrl(@Param('provider', new ParseEnumPipe(HOLY365_SNS_PROVIDER)) provider: HOLY365_SNS_PROVIDER, @Body() request: Holy365AuthorizeUrlRequest) {
    return new Holy365AuthorizeUrlResponse(this.authUseCase.authorizeUrl(provider, request.redirectUri, request.state));
  }

  @RestApiPost(Holy365LoginResponse, { path: '/sns', description: '소셜 로그인 — 콜백의 code 를 교환 (미가입 시 자동 가입)' })
  async snsLogin(@Body() request: Holy365SnsLoginRequest) {
    const { user, auth } = await this.authUseCase.snsLogin(request);

    return new Holy365LoginResponse(user, auth);
  }

  @RestApiPost(Holy365TokensResponse, { path: '/refresh', description: '토큰 재발급' })
  async refresh(@Body() request: Holy365RefreshRequest) {
    return new Holy365TokensResponse(await this.authUseCase.refresh(request.refreshToken));
  }

  @RestApiPost(OkResponse, { path: '/logout', description: '로그아웃 (이 세션의 refresh token 폐기)' })
  async logout(@Body() request: Holy365RefreshRequest) {
    await this.authUseCase.logout(request.refreshToken);
  }
}
