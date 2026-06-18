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
import { OnchurchSendBulkSmsUseCase } from '@/onchurch/master/application/usecase/onchurch-send-bulk-sms.usecase';
import { OnchurchListSmsLogsUseCase } from '@/onchurch/master/application/usecase/onchurch-list-sms-logs.usecase';
import {
  OnchurchCreateSmsTemplateUseCase,
  OnchurchListSmsTemplatesUseCase,
  OnchurchDeleteSmsTemplateUseCase,
} from '@/onchurch/master/application/usecase/onchurch-sms-template.usecase';
import { OnchurchListChurchesUseCase } from '@/onchurch/master/application/usecase/onchurch-list-churches.usecase';
import { OnchurchListChurchesRequest } from '@/onchurch/master/presentation/dto/request/onchurch-list-churches.request';
import { OnchurchChurchOverviewListResponse } from '@/onchurch/master/presentation/dto/response/onchurch-church-overview.response';
import { OnchurchSendBulkEmailRequest } from '@/onchurch/master/presentation/dto/request/onchurch-send-bulk-email.request';
import { OnchurchListEmailLogsRequest } from '@/onchurch/master/presentation/dto/request/onchurch-list-email-logs.request';
import { OnchurchCreateEmailTemplateRequest } from '@/onchurch/master/presentation/dto/request/onchurch-create-email-template.request';
import { OnchurchSendBulkSmsRequest } from '@/onchurch/master/presentation/dto/request/onchurch-send-bulk-sms.request';
import { OnchurchListSmsLogsRequest } from '@/onchurch/master/presentation/dto/request/onchurch-list-sms-logs.request';
import { OnchurchCreateSmsTemplateRequest } from '@/onchurch/master/presentation/dto/request/onchurch-create-sms-template.request';
import { OnchurchBulkEmailResultResponse } from '@/onchurch/master/presentation/dto/response/onchurch-bulk-email-result.response';
import { OnchurchEmailLogListResponse } from '@/onchurch/master/presentation/dto/response/onchurch-email-log.response';
import {
  OnchurchEmailTemplateListResponse,
  OnchurchEmailTemplateResponse,
} from '@/onchurch/master/presentation/dto/response/onchurch-email-template.response';
import { OnchurchBulkSmsResultResponse } from '@/onchurch/master/presentation/dto/response/onchurch-bulk-sms-result.response';
import { OnchurchSmsLogListResponse } from '@/onchurch/master/presentation/dto/response/onchurch-sms-log.response';
import {
  OnchurchSmsTemplateListResponse,
  OnchurchSmsTemplateResponse,
} from '@/onchurch/master/presentation/dto/response/onchurch-sms-template.response';

@RestApiController('/onchurch/master', 'Onchurch Master')
export class OnchurchMasterController {
  constructor(
    private readonly sendBulkEmailUseCase: OnchurchSendBulkEmailUseCase,
    private readonly listEmailLogsUseCase: OnchurchListEmailLogsUseCase,
    private readonly createEmailTemplateUseCase: OnchurchCreateEmailTemplateUseCase,
    private readonly listEmailTemplatesUseCase: OnchurchListEmailTemplatesUseCase,
    private readonly deleteEmailTemplateUseCase: OnchurchDeleteEmailTemplateUseCase,
    private readonly sendBulkSmsUseCase: OnchurchSendBulkSmsUseCase,
    private readonly listSmsLogsUseCase: OnchurchListSmsLogsUseCase,
    private readonly createSmsTemplateUseCase: OnchurchCreateSmsTemplateUseCase,
    private readonly listSmsTemplatesUseCase: OnchurchListSmsTemplatesUseCase,
    private readonly deleteSmsTemplateUseCase: OnchurchDeleteSmsTemplateUseCase,
    private readonly listChurchesUseCase: OnchurchListChurchesUseCase,
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

  @RestApiPost(OnchurchBulkSmsResultResponse, { path: '/sms', description: '마스터 전용 대량 문자 발송', auth: [USER_TYPE.CLIENT] })
  async sendBulkSms(@AuthSignature() signature: UserSignature, @Body() request: OnchurchSendBulkSmsRequest) {
    const result = await this.sendBulkSmsUseCase.execute(signature.id, {
      subject: request.subject.trim(),
      content: request.content,
      recipients: request.recipients,
    });
    return new OnchurchBulkSmsResultResponse(result);
  }

  @RestApiGet(OnchurchSmsLogListResponse, { path: '/sms', description: '마스터 전용 문자 발송 내역 조회', auth: [USER_TYPE.CLIENT] })
  async listSmsLogs(@AuthSignature() signature: UserSignature, @Query() request: OnchurchListSmsLogsRequest) {
    const result = await this.listSmsLogsUseCase.execute(signature.id, {
      keyword: request.keyword?.trim() || null,
      page: request.page,
      size: request.size,
    });
    return new OnchurchSmsLogListResponse(result);
  }

  @RestApiGet(OnchurchSmsTemplateListResponse, { path: '/sms-templates', description: '문자 템플릿 목록 조회', auth: [USER_TYPE.CLIENT] })
  async listSmsTemplates(@AuthSignature() signature: UserSignature) {
    const templates = await this.listSmsTemplatesUseCase.execute(signature.id);
    return new OnchurchSmsTemplateListResponse(templates);
  }

  @RestApiPost(OnchurchSmsTemplateResponse, { path: '/sms-templates', description: '문자 템플릿 저장', auth: [USER_TYPE.CLIENT] })
  async createSmsTemplate(@AuthSignature() signature: UserSignature, @Body() request: OnchurchCreateSmsTemplateRequest) {
    const template = await this.createSmsTemplateUseCase.execute(signature.id, {
      name: request.name.trim(),
      subject: request.subject.trim(),
      content: request.content,
    });
    return new OnchurchSmsTemplateResponse(template);
  }

  @RestApiDelete(OkResponse, { path: '/sms-templates/:id', description: '문자 템플릿 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteSmsTemplate(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteSmsTemplateUseCase.execute(signature.id, id);
    return new OkResponse();
  }

  @RestApiGet(OnchurchChurchOverviewListResponse, { path: '/churches', description: '마스터 전용 교회 목록 조회(소유자·구독 현황)', auth: [USER_TYPE.CLIENT] })
  async listChurches(@AuthSignature() signature: UserSignature, @Query() request: OnchurchListChurchesRequest) {
    const result = await this.listChurchesUseCase.execute(signature.id, {
      keyword: request.keyword?.trim() || null,
      page: request.page,
      size: request.size,
    });
    return new OnchurchChurchOverviewListResponse(result);
  }
}
