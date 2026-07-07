import { RestApiController, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { Body } from '@nestjs/common';
import { OnchurchSignupUseCase } from '@/onchurch/auth/application/usecase/onchurch-signup.usecase';
import { OnchurchSignupWithChurchUseCase } from '@/onchurch/auth/application/usecase/onchurch-signup-with-church.usecase';
import { OnchurchCheckLoginIdUseCase } from '@/onchurch/auth/application/usecase/onchurch-check-login-id.usecase';
import { OnchurchLoginUseCase } from '@/onchurch/auth/application/usecase/onchurch-login.usecase';
import { OnchurchRefreshTokensUseCase } from '@/onchurch/auth/application/usecase/onchurch-refresh-tokens.usecase';
import { OnchurchSendVerificationUseCase } from '@/onchurch/auth/application/usecase/onchurch-send-verification.usecase';
import { OnchurchVerifyCodeUseCase } from '@/onchurch/auth/application/usecase/onchurch-verify-code.usecase';
import { OnchurchFindLoginIdsUseCase } from '@/onchurch/auth/application/usecase/onchurch-find-login-ids.usecase';
import { OnchurchResetPasswordUseCase } from '@/onchurch/auth/application/usecase/onchurch-reset-password.usecase';
import { OnchurchSignupRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-signup.request';
import { OnchurchSignupWithChurchRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-signup-with-church.request';
import { OnchurchLoginRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-login.request';
import { OnchurchRefreshTokensRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-refresh-tokens.request';
import { OnchurchSendVerificationRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-send-verification.request';
import { OnchurchVerifyCodeRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-verify-code.request';
import { OnchurchFindLoginIdsRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-find-login-ids.request';
import { OnchurchResetPasswordRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-reset-password.request';
import { OnchurchAuthTokensResponse } from '@/onchurch/auth/presentation/dto/response/onchurch-auth-tokens.response';
import { OnchurchSendVerificationResponse, OnchurchVerifyCodeResponse } from '@/onchurch/auth/presentation/dto/response/onchurch-send-verification.response';
import { OnchurchFindLoginIdsResponse } from '@/onchurch/auth/presentation/dto/response/onchurch-find-login-ids.response';
import { OnchurchCheckLoginIdRequest } from '@/onchurch/auth/presentation/dto/request/onchurch-check-login-id.request';
import { OnchurchCheckLoginIdResponse } from '@/onchurch/auth/presentation/dto/response/onchurch-check-login-id.response';
import { OkResponse } from '@/common/response/ok.response';

@RestApiController('/onchurch/auths', 'Onchurch Auth')
export class OnchurchAuthController {
  constructor(
    private readonly signupUseCase: OnchurchSignupUseCase,
    private readonly signupWithChurchUseCase: OnchurchSignupWithChurchUseCase,
    private readonly checkLoginIdUseCase: OnchurchCheckLoginIdUseCase,
    private readonly loginUseCase: OnchurchLoginUseCase,
    private readonly refreshTokensUseCase: OnchurchRefreshTokensUseCase,
    private readonly sendVerificationUseCase: OnchurchSendVerificationUseCase,
    private readonly verifyCodeUseCase: OnchurchVerifyCodeUseCase,
    private readonly findLoginIdsUseCase: OnchurchFindLoginIdsUseCase,
    private readonly resetPasswordUseCase: OnchurchResetPasswordUseCase,
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

  @RestApiPost(OnchurchFindLoginIdsResponse, { path: '/find-id', description: '온처치 아이디 찾기 (휴대폰 인증 후 해당 연락처의 아이디 목록 반환)' })
  async findLoginIds(@Body() request: OnchurchFindLoginIdsRequest) {
    const accounts = await this.findLoginIdsUseCase.execute(request.phone, (request.churchSlug ?? '').trim() || null);

    return new OnchurchFindLoginIdsResponse(accounts);
  }

  @RestApiPut(OkResponse, { path: '/reset-password', description: '온처치 비밀번호 재설정 (아이디+휴대폰 인증 후 새 비밀번호 설정)' })
  async resetPassword(@Body() request: OnchurchResetPasswordRequest) {
    await this.resetPasswordUseCase.execute({
      loginId: request.loginId,
      phone: request.phone,
      newPassword: request.newPassword,
      churchSlug: (request.churchSlug ?? '').trim() || null,
    });

    return new OkResponse();
  }

  @RestApiPost(OnchurchCheckLoginIdResponse, { path: '/check-id', description: '온처치 아이디 중복 확인 (available=true면 사용 가능)' })
  async checkLoginId(@Body() request: OnchurchCheckLoginIdRequest) {
    const available = await this.checkLoginIdUseCase.execute(request.loginId);

    return new OnchurchCheckLoginIdResponse(available);
  }

  @RestApiPost(OnchurchAuthTokensResponse, { path: '/sign-up', description: '온처치 회원가입' })
  async signup(@Body() request: OnchurchSignupRequest) {
    const auth = await this.signupUseCase.execute(request.toCommand());

    return new OnchurchAuthTokensResponse(auth);
  }

  @RestApiPost(OnchurchAuthTokensResponse, { path: '/sign-up-with-church', description: '온처치 랜딩 위저드 통합 가입 (교회 정보 입력 후 계정 자동 생성 + 자동 공개)' })
  async signupWithChurch(@Body() request: OnchurchSignupWithChurchRequest) {
    const auth = await this.signupWithChurchUseCase.execute(request.toCommand());

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
