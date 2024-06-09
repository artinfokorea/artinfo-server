import { RestApiController, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { Body } from '@nestjs/common';
import { VerificationService } from '@/auth/service/verificationService';
import { MobileVerificationRequest } from '@/auth/dto/request/mobile-verification.request';
import { USER_TYPE } from '@/user/entity/user.entity';
import { VerifyMobileRequest } from '@/auth/dto/request/verify-mobile.request';

@RestApiController('/verifications', 'Verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

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
}
