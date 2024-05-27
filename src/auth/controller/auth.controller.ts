import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { SignUpRequest } from '@/auth/dto/request/sign-up.request';
import { AuthService } from '@/auth/service/auth.service';
import { OkResponse } from '@/common/response/ok.response';
import { Body } from '@nestjs/common';
import { LoginRequest } from '@/auth/dto/request/login.request';
import { LoginResponse } from '@/auth/dto/response/login.response';

@RestApiController('/auths', 'Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RestApiPost(OkResponse, { path: '/sign-up', description: '회원 가입' })
  async signup(@Body() request: SignUpRequest) {
    await this.authService.signup(request.toCommand());
  }

  @RestApiPost(LoginResponse, { path: '/login/email', description: '로그인' })
  async loginByEmail(@Body() request: LoginRequest) {
    const auth = await this.authService.emailLogin(request.toCommand());

    return new LoginResponse(auth);
  }
}
