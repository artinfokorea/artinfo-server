import { Body, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OnchurchSendBulkEmailUseCase } from '@/onchurch/master/application/usecase/onchurch-send-bulk-email.usecase';
import { OnchurchListEmailLogsUseCase } from '@/onchurch/master/application/usecase/onchurch-list-email-logs.usecase';
import { OnchurchSendBulkEmailRequest } from '@/onchurch/master/presentation/dto/request/onchurch-send-bulk-email.request';
import { OnchurchListEmailLogsRequest } from '@/onchurch/master/presentation/dto/request/onchurch-list-email-logs.request';
import { OnchurchBulkEmailResultResponse } from '@/onchurch/master/presentation/dto/response/onchurch-bulk-email-result.response';
import { OnchurchEmailLogListResponse } from '@/onchurch/master/presentation/dto/response/onchurch-email-log.response';

@RestApiController('/onchurch/master', 'Onchurch Master')
export class OnchurchMasterController {
  constructor(
    private readonly sendBulkEmailUseCase: OnchurchSendBulkEmailUseCase,
    private readonly listEmailLogsUseCase: OnchurchListEmailLogsUseCase,
  ) {}

  @RestApiPost(OnchurchBulkEmailResultResponse, { path: '/emails', description: '마스터 전용 대량 메일 발송', auth: [USER_TYPE.CLIENT] })
  async sendBulkEmail(@AuthSignature() signature: UserSignature, @Body() request: OnchurchSendBulkEmailRequest) {
    const result = await this.sendBulkEmailUseCase.execute(signature.id, {
      subject: request.subject.trim(),
      content: request.content,
      recipients: request.recipients,
    });
    return new OnchurchBulkEmailResultResponse(result);
  }

  @RestApiGet(OnchurchEmailLogListResponse, { path: '/emails', description: '마스터 전용 메일 발송 내역 조회', auth: [USER_TYPE.CLIENT] })
  async listEmailLogs(@AuthSignature() signature: UserSignature, @Query() request: OnchurchListEmailLogsRequest) {
    const result = await this.listEmailLogsUseCase.execute(signature.id, {
      keyword: request.keyword?.trim() || null,
      page: request.page,
      size: request.size,
    });
    return new OnchurchEmailLogListResponse(result);
  }
}
