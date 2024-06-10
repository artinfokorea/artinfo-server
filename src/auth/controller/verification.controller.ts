import { RestApiController, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { Body, Query } from '@nestjs/common';
import { VerificationService } from '@/auth/service/verificationService';
import { MobileVerificationRequest } from '@/auth/dto/request/mobile-verification.request';
import { USER_TYPE } from '@/user/entity/user.entity';
import { VerifyMobileRequest } from '@/auth/dto/request/verify-mobile.request';
import { EmailVerificationRequest } from '@/auth/dto/request/email-verification.request';
import { VerifyEmailRequest } from '@/auth/dto/request/verify-email.request';
import { EmailExistenceResponse } from '@/auth/dto/response/email-existence.response';

@RestApiController('/verifications', 'Verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @RestApiGet(OkResponse, { path: '/email/existence', description: '이메일 중복 확인' })
  async checkEmailDuplication(@Query() request: EmailVerificationRequest) {
    const existence = await this.verificationService.checkEmailExistence(request.email);

    return new EmailExistenceResponse(existence);
  }

  @RestApiPost(OkResponse, { path: '/mobile', description: '휴대폰 인증 번호 전송', auth: [USER_TYPE.CLIENT] })
  async sendVerificationNumberMessage(@Body() request: MobileVerificationRequest) {
    const dashDeletedPhoneNumber = request.phone.replace(/-/g, '');
    await this.verificationService.sendVerificationNumberMessage(dashDeletedPhoneNumber);
  }

  @RestApiPut(OkResponse, { path: '/mobile', description: '휴대폰 인증 번호 확인', auth: [USER_TYPE.CLIENT] })
  async verifyMobile(@Body() request: VerifyMobileRequest) {
    const dashDeletedPhoneNumber = request.phone.replace(/-/g, '');
    await this.verificationService.verifyMobile(dashDeletedPhoneNumber, request.verification);
  }

  @RestApiPost(OkResponse, { path: '/email', description: '이메일 인증 번호 전송' })
  async sendVerificationNumberEmail(@Body() request: EmailVerificationRequest) {
    await this.verificationService.sendVerificationNumberEmail(request.email);
  }

  @RestApiPut(OkResponse, { path: '/email', description: '이메일 인증 번호 확인' })
  async verifyEmail(@Body() request: VerifyEmailRequest) {
    await this.verificationService.verifyEmail(request.email, request.verification);
  }
}
