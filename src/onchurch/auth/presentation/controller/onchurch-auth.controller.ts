import { RestApiController, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { Body } from '@nestjs/common';
import { OnchurchSignupUseCase } from '@/onchurch/auth/application/usecase/onchurch-signup.usecase';
import { OnchurchLoginUseCase } from '@/onchurch/auth/application/usecase/onchurch-login.usecase';
import { OnchurchRefreshTokensUseCase } from '@/onchurch/auth/application/usecase/onchurch-refresh-tokens.usecase';
import { OnchurchSendVerificationUseCase } from '@/onchurch/auth/application/usecase/onchurch-send-verification.usecase';
import { OnchurchVerifyCodeUseCase } from '@/onchurch/auth/application/usecase/onchurch-verify-code.usecase';
import { OnchurchSignupRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-signup.request';
import { OnchurchLoginRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-login.request';
import { OnchurchRefreshTokensRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-refresh-tokens.request';
import { OnchurchSendVerificationRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-send-verification.request';
import { OnchurchVerifyCodeRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-verify-code.request';
import { OnchurchAuthTokensResponse } from '@/onchurch/auth/presentation/dto/response/onchurch-auth-tokens.response';
import { OnchurchSendVerificationResponse, OnchurchVerifyCodeResponse } from '@/onchurch/auth/presentation/dto/response/onchurch-send-verification.response';

@RestApiController('/onchurch/auths', 'Onchurch Auth')
export class OnchurchAuthController {
  constructor(
    private readonly signupUseCase: OnchurchSignupUseCase,
    private readonly loginUseCase: OnchurchLoginUseCase,
    private readonly refreshTokensUseCase: OnchurchRefreshTokensUseCase,
    private readonly sendVerificationUseCase: OnchurchSendVerificationUseCase,
    private readonly verifyCodeUseCase: OnchurchVerifyCodeUseCase,
  ) {}

  @RestApiPost(OnchurchSendVerificationResponse, { path: '/verifications/mobile', description: '온처치 휴대폰 인증번호 발송' })
  async sendVerification(@Body() request: OnchurchSendVerificationRequest) {
    await this.sendVerificationUseCase.execute(request.phone);

    return new OnchurchSendVerificationResponse(true);
  }

  @RestApiPut(OnchurchVerifyCodeResponse, { path: '/verifications/mobile', description: '온처치 휴대폰 인증번호 검증' })
  async verifyCode(@Body() request: OnchurchVerifyCodeRequest) {
    await this.verifyCodeUseCase.execute(request.phone, request.code);

    return new OnchurchVerifyCodeResponse(true);
  }

  @RestApiPost(OnchurchAuthTokensResponse, { path: '/sign-up', description: '온처치 회원가입' })
  async signup(@Body() request: OnchurchSignupRequest) {
    const auth = await this.signupUseCase.execute(request.toCommand());

    return new OnchurchAuthTokensResponse(auth);
  }

  @RestApiPost(OnchurchAuthTokensResponse, { path: '/login', description: '온처치 로그인' })
  async login(@Body() request: OnchurchLoginRequest) {
    const auth = await this.loginUseCase.execute(request.toCommand());

    return new OnchurchAuthTokensResponse(auth);
  }

  @RestApiPost(OnchurchAuthTokensResponse, { path: '/refresh', description: '온처치 토큰 재발급' })
  async refreshTokens(@Body() request: OnchurchRefreshTokensRequest) {
    const auth = await this.refreshTokensUseCase.execute(request.accessToken, request.refreshToken);

    return new OnchurchAuthTokensResponse(auth);
  }
}
