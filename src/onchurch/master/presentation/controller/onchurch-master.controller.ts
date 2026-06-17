import { Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchSendBulkEmailUseCase } from '@/onchurch/master/application/usecase/onchurch-send-bulk-email.usecase';
import { OnchurchListEmailLogsUseCase } from '@/onchurch/master/application/usecase/onchurch-list-email-logs.usecase';
import {
  OnchurchCreateEmailTemplateUseCase,
  OnchurchListEmailTemplatesUseCase,
  OnchurchDeleteEmailTemplateUseCase,
} from '@/onchurch/master/application/usecase/onchurch-email-template.usecase';
import { OnchurchSendBulkEmailRequest } from '@/onchurch/master/presentation/dto/request/onchurch-send-bulk-email.request';
import { OnchurchListEmailLogsRequest } from '@/onchurch/master/presentation/dto/request/onchurch-list-email-logs.request';
import { OnchurchCreateEmailTemplateRequest } from '@/onchurch/master/presentation/dto/request/onchurch-create-email-template.request';
import { OnchurchBulkEmailResultResponse } from '@/onchurch/master/presentation/dto/response/onchurch-bulk-email-result.response';
import { OnchurchEmailLogListResponse } from '@/onchurch/master/presentation/dto/response/onchurch-email-log.response';
import {
  OnchurchEmailTemplateListResponse,
  OnchurchEmailTemplateResponse,
} from '@/onchurch/master/presentation/dto/response/onchurch-email-template.response';

@RestApiController('/onchurch/master', 'Onchurch Master')
export class OnchurchMasterController {
  constructor(
    private readonly sendBulkEmailUseCase: OnchurchSendBulkEmailUseCase,
    private readonly listEmailLogsUseCase: OnchurchListEmailLogsUseCase,
    private readonly createEmailTemplateUseCase: OnchurchCreateEmailTemplateUseCase,
    private readonly listEmailTemplatesUseCase: OnchurchListEmailTemplatesUseCase,
    private readonly deleteEmailTemplateUseCase: OnchurchDeleteEmailTemplateUseCase,
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

  @RestApiGet(OnchurchEmailTemplateListResponse, { path: '/email-templates', description: '메일 템플릿 목록 조회', auth: [USER_TYPE.CLIENT] })
  async listEmailTemplates(@AuthSignature() signature: UserSignature) {
    const templates = await this.listEmailTemplatesUseCase.execute(signature.id);
    return new OnchurchEmailTemplateListResponse(templates);
  }

  @RestApiPost(OnchurchEmailTemplateResponse, { path: '/email-templates', description: '메일 템플릿 저장', auth: [USER_TYPE.CLIENT] })
  async createEmailTemplate(@AuthSignature() signature: UserSignature, @Body() request: OnchurchCreateEmailTemplateRequest) {
    const template = await this.createEmailTemplateUseCase.execute(signature.id, {
      name: request.name.trim(),
      subject: request.subject.trim(),
      content: request.content,
    });
    return new OnchurchEmailTemplateResponse(template);
  }

  @RestApiDelete(OkResponse, { path: '/email-templates/:id', description: '메일 템플릿 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteEmailTemplate(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteEmailTemplateUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
