import { Body } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OnchurchSendBulkEmailUseCase } from '@/onchurch/master/application/usecase/onchurch-send-bulk-email.usecase';
import { OnchurchSendBulkEmailRequest } from '@/onchurch/master/presentation/dto/request/onchurch-send-bulk-email.request';
import { OnchurchBulkEmailResultResponse } from '@/onchurch/master/presentation/dto/response/onchurch-bulk-email-result.response';

@RestApiController('/onchurch/master', 'Onchurch Master')
export class OnchurchMasterController {
  constructor(private readonly sendBulkEmailUseCase: OnchurchSendBulkEmailUseCase) {}

  @RestApiPost(OnchurchBulkEmailResultResponse, { path: '/emails', description: '마스터 전용 대량 메일 발송', auth: [USER_TYPE.CLIENT] })
  async sendBulkEmail(@AuthSignature() signature: UserSignature, @Body() request: OnchurchSendBulkEmailRequest) {
    const result = await this.sendBulkEmailUseCase.execute(signature.id, {
      subject: request.subject.trim(),
      content: request.content,
      recipients: request.recipients,
    });
    return new OnchurchBulkEmailResultResponse(result);
  }
}
