import { Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchEnqueueBulkEmailUseCase } from '@/onchurch/master/application/usecase/onchurch-enqueue-bulk-email.usecase';
import { OnchurchListEmailLogsUseCase } from '@/onchurch/master/application/usecase/onchurch-list-email-logs.usecase';
import { OnchurchGetEmailLogUseCase } from '@/onchurch/master/application/usecase/onchurch-get-email-log.usecase';
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
import { OnchurchUpdateChurchPaidUntilUseCase } from '@/onchurch/master/application/usecase/onchurch-update-church-paid-until.usecase';
import { OnchurchUpdateChurchNaverVerificationUseCase } from '@/onchurch/master/application/usecase/onchurch-update-church-naver-verification.usecase';
import { OnchurchUpdateChurchSiteTemplateUseCase } from '@/onchurch/master/application/usecase/onchurch-update-church-site-template.usecase';
import { OnchurchUpdateChurchPublishedUseCase } from '@/onchurch/master/application/usecase/onchurch-update-church-published.usecase';
import { OnchurchTransferChurchOwnerUseCase } from '@/onchurch/master/application/usecase/onchurch-transfer-church-owner.usecase';
import { OnchurchSearchUsersUseCase } from '@/onchurch/master/application/usecase/onchurch-search-users.usecase';
import { OnchurchListChurchesRequest } from '@/onchurch/master/presentation/dto/request/onchurch-list-churches.request';
import { OnchurchUpdateChurchPaidUntilRequest } from '@/onchurch/master/presentation/dto/request/onchurch-update-church-paid-until.request';
import { OnchurchUpdateChurchNaverVerificationRequest } from '@/onchurch/master/presentation/dto/request/onchurch-update-church-naver-verification.request';
import { OnchurchUpdateChurchSiteTemplateRequest } from '@/onchurch/master/presentation/dto/request/onchurch-update-church-site-template.request';
import { OnchurchUpdateChurchPublishedRequest } from '@/onchurch/master/presentation/dto/request/onchurch-update-church-published.request';
import { OnchurchTransferChurchOwnerRequest } from '@/onchurch/master/presentation/dto/request/onchurch-transfer-church-owner.request';
import { OnchurchSearchUsersRequest } from '@/onchurch/master/presentation/dto/request/onchurch-search-users.request';
import { OnchurchChurchOverviewListResponse } from '@/onchurch/master/presentation/dto/response/onchurch-church-overview.response';
import { OnchurchChurchPaidUntilResponse } from '@/onchurch/master/presentation/dto/response/onchurch-church-paid-until.response';
import { OnchurchChurchNaverVerificationResponse } from '@/onchurch/master/presentation/dto/response/onchurch-church-naver-verification.response';
import { OnchurchChurchSiteTemplateResponse } from '@/onchurch/master/presentation/dto/response/onchurch-church-site-template.response';
import { OnchurchChurchPublishedResponse } from '@/onchurch/master/presentation/dto/response/onchurch-church-published.response';
import { OnchurchTransferChurchOwnerResponse } from '@/onchurch/master/presentation/dto/response/onchurch-transfer-church-owner.response';
import { OnchurchUserCandidateListResponse } from '@/onchurch/master/presentation/dto/response/onchurch-user-candidate.response';
import {
  OnchurchCreateLedgerEntryUseCase,
  OnchurchListLedgerEntriesUseCase,
  OnchurchDeleteLedgerEntryUseCase,
} from '@/onchurch/master/application/usecase/onchurch-ledger.usecase';
import { OnchurchGetDashboardUseCase } from '@/onchurch/master/application/usecase/onchurch-dashboard.usecase';
import { OnchurchDashboardRequest } from '@/onchurch/master/presentation/dto/request/onchurch-dashboard.request';
import { OnchurchDashboardResponse } from '@/onchurch/master/presentation/dto/response/onchurch-dashboard.response';
import { OnchurchCreateLedgerEntryRequest } from '@/onchurch/master/presentation/dto/request/onchurch-create-ledger-entry.request';
import { OnchurchListLedgerEntriesRequest } from '@/onchurch/master/presentation/dto/request/onchurch-list-ledger-entries.request';
import {
  OnchurchLedgerEntryResponse,
  OnchurchLedgerListResponse,
} from '@/onchurch/master/presentation/dto/response/onchurch-ledger-entry.response';
import { OnchurchSendBulkEmailRequest } from '@/onchurch/master/presentation/dto/request/onchurch-send-bulk-email.request';
import { OnchurchListEmailLogsRequest } from '@/onchurch/master/presentation/dto/request/onchurch-list-email-logs.request';
import { OnchurchCreateEmailTemplateRequest } from '@/onchurch/master/presentation/dto/request/onchurch-create-email-template.request';
import { OnchurchSendBulkSmsRequest } from '@/onchurch/master/presentation/dto/request/onchurch-send-bulk-sms.request';
import { OnchurchListSmsLogsRequest } from '@/onchurch/master/presentation/dto/request/onchurch-list-sms-logs.request';
import { OnchurchCreateSmsTemplateRequest } from '@/onchurch/master/presentation/dto/request/onchurch-create-sms-template.request';
import { OnchurchEnqueueBulkEmailResponse } from '@/onchurch/master/presentation/dto/response/onchurch-enqueue-bulk-email.response';
import { OnchurchEmailLogListResponse, OnchurchEmailLogResponse } from '@/onchurch/master/presentation/dto/response/onchurch-email-log.response';
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
    private readonly enqueueBulkEmailUseCase: OnchurchEnqueueBulkEmailUseCase,
    private readonly listEmailLogsUseCase: OnchurchListEmailLogsUseCase,
    private readonly getEmailLogUseCase: OnchurchGetEmailLogUseCase,
    private readonly createEmailTemplateUseCase: OnchurchCreateEmailTemplateUseCase,
    private readonly listEmailTemplatesUseCase: OnchurchListEmailTemplatesUseCase,
    private readonly deleteEmailTemplateUseCase: OnchurchDeleteEmailTemplateUseCase,
    private readonly sendBulkSmsUseCase: OnchurchSendBulkSmsUseCase,
    private readonly listSmsLogsUseCase: OnchurchListSmsLogsUseCase,
    private readonly createSmsTemplateUseCase: OnchurchCreateSmsTemplateUseCase,
    private readonly listSmsTemplatesUseCase: OnchurchListSmsTemplatesUseCase,
    private readonly deleteSmsTemplateUseCase: OnchurchDeleteSmsTemplateUseCase,
    private readonly listChurchesUseCase: OnchurchListChurchesUseCase,
    private readonly updateChurchPaidUntilUseCase: OnchurchUpdateChurchPaidUntilUseCase,
    private readonly updateChurchNaverVerificationUseCase: OnchurchUpdateChurchNaverVerificationUseCase,
    private readonly updateChurchSiteTemplateUseCase: OnchurchUpdateChurchSiteTemplateUseCase,
    private readonly updateChurchPublishedUseCase: OnchurchUpdateChurchPublishedUseCase,
    private readonly transferChurchOwnerUseCase: OnchurchTransferChurchOwnerUseCase,
    private readonly searchUsersUseCase: OnchurchSearchUsersUseCase,
    private readonly createLedgerEntryUseCase: OnchurchCreateLedgerEntryUseCase,
    private readonly listLedgerEntriesUseCase: OnchurchListLedgerEntriesUseCase,
    private readonly deleteLedgerEntryUseCase: OnchurchDeleteLedgerEntryUseCase,
    private readonly getDashboardUseCase: OnchurchGetDashboardUseCase,
  ) {}

  @RestApiGet(OnchurchDashboardResponse, { path: '/dashboard', description: '마스터 대시보드 통계(월별 재무·가입 퍼널·결제 교회 유입)', auth: [USER_TYPE.CLIENT] })
  async getDashboard(@AuthSignature() signature: UserSignature, @Query() request: OnchurchDashboardRequest) {
    const result = await this.getDashboardUseCase.execute(signature.id, { month: request.month });
    return new OnchurchDashboardResponse(result);
  }

  @RestApiPost(OnchurchEnqueueBulkEmailResponse, { path: '/emails', description: '마스터 전용 대량 메일 발송(큐 적재)', auth: [USER_TYPE.CLIENT] })
  async sendBulkEmail(@AuthSignature() signature: UserSignature, @Body() request: OnchurchSendBulkEmailRequest) {
    const result = await this.enqueueBulkEmailUseCase.execute(signature.id, {
      subject: request.subject.trim(),
      content: request.content,
      recipients: request.recipients,
    });
    return new OnchurchEnqueueBulkEmailResponse(result);
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

  @RestApiGet(OnchurchEmailLogResponse, { path: '/emails/:id', description: '마스터 전용 메일 발송 진행 상황 조회(폴링)', auth: [USER_TYPE.CLIENT] })
  async getEmailLog(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    const log = await this.getEmailLogUseCase.execute(signature.id, id);
    return new OnchurchEmailLogResponse(log);
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
      publishedOnly: request.publishedOnly ?? true,
      page: request.page,
      size: request.size,
    });
    return new OnchurchChurchOverviewListResponse(result);
  }

  @RestApiPut(OnchurchChurchPaidUntilResponse, { path: '/churches/:id/paid-until', description: '교회 결제 만료일 변경', auth: [USER_TYPE.CLIENT] })
  async updateChurchPaidUntil(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchUpdateChurchPaidUntilRequest,
  ) {
    // 'YYYY-MM-DD' → 한국시간(KST, +09:00) 해당 일자 23:59:59로 저장해 그 날짜까지 결제 유효로 본다.
    // (오프셋을 명시하지 않으면 서버 타임존 기준이 되어 KST로는 하루 밀릴 수 있음)
    const paidUntil = request.paidUntil ? new Date(`${request.paidUntil}T23:59:59+09:00`) : null;
    const result = await this.updateChurchPaidUntilUseCase.execute(signature.id, id, paidUntil);
    return new OnchurchChurchPaidUntilResponse(result.paidUntil);
  }

  @RestApiPut(OnchurchChurchNaverVerificationResponse, { path: '/churches/:id/naver-verification', description: '교회 네이버 사이트 인증 코드 변경', auth: [USER_TYPE.CLIENT] })
  async updateChurchNaverVerification(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchUpdateChurchNaverVerificationRequest,
  ) {
    const result = await this.updateChurchNaverVerificationUseCase.execute(signature.id, id, request.naverVerification);
    return new OnchurchChurchNaverVerificationResponse(result.naverVerification);
  }

  @RestApiPut(OnchurchChurchSiteTemplateResponse, { path: '/churches/:id/site-template', description: '교회 공개 홈페이지 템플릿 변경', auth: [USER_TYPE.CLIENT] })
  async updateChurchSiteTemplate(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchUpdateChurchSiteTemplateRequest,
  ) {
    const result = await this.updateChurchSiteTemplateUseCase.execute(signature.id, id, request.siteTemplate);
    return new OnchurchChurchSiteTemplateResponse(result.siteTemplate);
  }

  @RestApiPut(OnchurchChurchPublishedResponse, { path: '/churches/:id/published', description: '교회 운영 여부(공개/비공개) 변경', auth: [USER_TYPE.CLIENT] })
  async updateChurchPublished(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchUpdateChurchPublishedRequest,
  ) {
    const result = await this.updateChurchPublishedUseCase.execute(signature.id, id, request.isPublished);
    return new OnchurchChurchPublishedResponse(result.isPublished);
  }

  @RestApiGet(OnchurchUserCandidateListResponse, { path: '/users', description: '마스터 전용 사용자 검색(오너 이관 대상)', auth: [USER_TYPE.CLIENT] })
  async searchUsers(@AuthSignature() signature: UserSignature, @Query() request: OnchurchSearchUsersRequest) {
    const users = await this.searchUsersUseCase.execute(signature.id, request.keyword?.trim() ?? '');
    return new OnchurchUserCandidateListResponse(users);
  }

  @RestApiPut(OnchurchTransferChurchOwnerResponse, { path: '/churches/:id/owner', description: '교회 소유자 이관(기존 오너는 일반 멤버로 강등)', auth: [USER_TYPE.CLIENT] })
  async transferChurchOwner(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchTransferChurchOwnerRequest,
  ) {
    const result = await this.transferChurchOwnerUseCase.execute(signature.id, id, request.userId);
    return new OnchurchTransferChurchOwnerResponse(result);
  }

  @RestApiPost(OnchurchLedgerEntryResponse, { path: '/ledger', description: '가계부 항목 등록', auth: [USER_TYPE.CLIENT] })
  async createLedgerEntry(@AuthSignature() signature: UserSignature, @Body() request: OnchurchCreateLedgerEntryRequest) {
    const entry = await this.createLedgerEntryUseCase.execute(signature.id, {
      entryDate: request.entryDate,
      type: request.type,
      amount: request.amount,
      category: request.category.trim(),
      memo: request.memo?.trim() || null,
    });
    return new OnchurchLedgerEntryResponse(entry);
  }

  @RestApiGet(OnchurchLedgerListResponse, { path: '/ledger', description: '가계부 목록 조회(월 필터·합계 포함)', auth: [USER_TYPE.CLIENT] })
  async listLedgerEntries(@AuthSignature() signature: UserSignature, @Query() request: OnchurchListLedgerEntriesRequest) {
    const result = await this.listLedgerEntriesUseCase.execute(signature.id, {
      month: request.month?.trim() || null,
      page: request.page,
      size: request.size,
    });
    return new OnchurchLedgerListResponse(result);
  }

  @RestApiDelete(OkResponse, { path: '/ledger/:id', description: '가계부 항목 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteLedgerEntry(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteLedgerEntryUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
