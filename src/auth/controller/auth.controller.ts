import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { SignUpRequest } from '@/auth/dto/request/sign-up.request';
import { AuthService } from '@/auth/service/auth.service';
import { OkResponse } from '@/common/response/ok.response';
import { Body } from '@nestjs/common';
import { EmailLoginRequest } from '@/auth/dto/request/email-login-request';
import { LoginResponse } from '@/auth/dto/response/login.response';
import { SnsLoginRequest } from '@/auth/dto/request/sns-login-request';

@RestApiController('/auths', 'Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RestApiPost(OkResponse, { path: '/sign-up', description: '회원 가입' })
  async signup(@Body() request: SignUpRequest) {
    await this.authService.signup(request.toCommand());
  }

  @RestApiPost(LoginResponse, { path: '/login/email', description: '이메일 로그인' })
  async loginByEmail(@Body() request: EmailLoginRequest) {
    const auth = await this.authService.loginByEmail(request.toCommand());

    return new LoginResponse(auth);
  }

  @RestApiPost(LoginResponse, { path: '/login/sns', description: '소셜 로그인' })
  async loginBySnS(@Body() request: SnsLoginRequest) {
    const auth = await this.authService.loginBySns(request.token, request.type);

    return new LoginResponse(auth);
  }
}
