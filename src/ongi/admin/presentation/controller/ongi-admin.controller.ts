import { Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RestApiController, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AdminActor, OngiAdminActor, OngiAdminGuard, RequireOngiAdminPermission } from '@/ongi/admin/presentation/guard/ongi-admin.guard';
import {
  OngiAdminConfigUseCase,
  OngiAdminDashboardUseCase,
  OngiAdminDirectoryUseCase,
  OngiAdminInquiryUseCase,
  OngiAdminMeUseCase,
  OngiAdminPhotoUseCase,
  OngiAdminReportUseCase,
} from '@/ongi/admin/application/usecase/ongi-admin.usecase';
import {
  OngiAdminConfigRequest,
  OngiAdminInquiryAnswerRequest,
  OngiAdminReportStatusRequest,
  OngiAdminUserTypeRequest,
} from '@/ongi/admin/presentation/dto/request/ongi-admin.request';
import {
  OngiAdminAccessLogListResponse,
  OngiAdminConfigListResponse,
  OngiAdminDashboardResponse,
  OngiAdminGroupDetailResponse,
  OngiAdminGroupListResponse,
  OngiAdminInquiryListResponse,
  OngiAdminMeResponse,
  OngiAdminOkResponse,
  OngiAdminPhotoListResponse,
  OngiAdminReportListResponse,
  OngiAdminUserDetailResponse,
  OngiAdminUserListResponse,
} from '@/ongi/admin/presentation/dto/response/ongi-admin.response';

const pageNumber = (raw?: string) => Math.max(1, Number.parseInt(raw ?? '1', 10) || 1);
const searchQuery = (raw?: string) => raw?.trim() || null;

/** 온기 관리자 — ADMIN · SUPER_ADMIN 만. 기능별 권한은 RequireOngiAdminPermission */
@ApiBearerAuth()
@UseGuards(OngiAdminGuard)
@RestApiController('/ongi/admin', 'Ongi Admin')
export class OngiAdminController {
  constructor(
    private readonly meUseCase: OngiAdminMeUseCase,
    private readonly dashboardUseCase: OngiAdminDashboardUseCase,
    private readonly reportUseCase: OngiAdminReportUseCase,
    private readonly directoryUseCase: OngiAdminDirectoryUseCase,
    private readonly configUseCase: OngiAdminConfigUseCase,
    private readonly photoUseCase: OngiAdminPhotoUseCase,
    private readonly inquiryUseCase: OngiAdminInquiryUseCase,
  ) {}

  @RestApiGet(OngiAdminMeResponse, { path: '/me', description: '내 관리자 등급과 권한' })
  async me(@AdminActor() actor: OngiAdminActor) {
    return new OngiAdminMeResponse(await this.meUseCase.execute(actor));
  }

  @RequireOngiAdminPermission('dashboard')
  @RestApiGet(OngiAdminDashboardResponse, { path: '/dashboard', description: '운영 현황' })
  async dashboard() {
    return new OngiAdminDashboardResponse(await this.dashboardUseCase.execute());
  }

  @RequireOngiAdminPermission('reports')
  @RestApiGet(OngiAdminReportListResponse, { path: '/reports', description: '신고 목록 — ?status=open|resolved, ?page=' })
  async reports(@Query('status') status?: string, @Query('page') page?: string) {
    return new OngiAdminReportListResponse(await this.reportUseCase.scan(status ?? null, pageNumber(page)));
  }

  @RequireOngiAdminPermission('reports')
  @RestApiPut(OngiAdminOkResponse, { path: '/reports/:id/status', description: '신고 처리 상태 변경' })
  async setReportStatus(@Param('id', ParseIntPipe) id: number, @Body() request: OngiAdminReportStatusRequest) {
    await this.reportUseCase.setStatus(id, request.status);

    return new OngiAdminOkResponse();
  }

  @RequireOngiAdminPermission('reports')
  @RestApiPost(OngiAdminOkResponse, { path: '/reports/:id/remove-target', description: '신고된 사진·댓글 삭제 후 처리 완료' })
  async removeReportTarget(@Param('id', ParseIntPipe) id: number) {
    await this.reportUseCase.removeTarget(id);

    return new OngiAdminOkResponse();
  }

  @RequireOngiAdminPermission('inquiries')
  @RestApiGet(OngiAdminInquiryListResponse, { path: '/inquiries', description: '앱 문의 — ?status=open|answered, ?page=' })
  async inquiries(@AdminActor() actor: OngiAdminActor, @Query('status') status?: string, @Query('page') page?: string) {
    return new OngiAdminInquiryListResponse(await this.inquiryUseCase.scan(actor, status ?? null, pageNumber(page)));
  }

  @RequireOngiAdminPermission('inquiries')
  @RestApiPut(OngiAdminOkResponse, { path: '/inquiries/:id/answer', description: '문의 답변 작성·수정 — 첫 답변이면 문의한 사용자에게 푸시' })
  async answerInquiry(@AdminActor() actor: OngiAdminActor, @Param('id', ParseIntPipe) id: number, @Body() request: OngiAdminInquiryAnswerRequest) {
    await this.inquiryUseCase.answer(actor, id, request.answer);

    return new OngiAdminOkResponse();
  }

  @RequireOngiAdminPermission('directory')
  @RestApiGet(OngiAdminUserListResponse, { path: '/users', description: '사용자 목록 — ?q=이름·id(최상위 등급은 이메일도), ?page=' })
  async users(@AdminActor() actor: OngiAdminActor, @Query('q') q?: string, @Query('page') page?: string) {
    return new OngiAdminUserListResponse(await this.directoryUseCase.scanUsers(actor, searchQuery(q), pageNumber(page)));
  }

  @RequireOngiAdminPermission('directory')
  @RestApiGet(OngiAdminUserDetailResponse, { path: '/users/:id', description: '사용자 상세 · 소속 가족 공간' })
  async user(@AdminActor() actor: OngiAdminActor, @Param('id', ParseIntPipe) id: number) {
    return new OngiAdminUserDetailResponse(await this.directoryUseCase.getUser(actor, id));
  }

  @RequireOngiAdminPermission('grant')
  @RestApiPut(OngiAdminOkResponse, { path: '/users/:id/type', description: '사용자 등급 변경 (USER ↔ ADMIN)' })
  async setUserType(@AdminActor() actor: OngiAdminActor, @Param('id', ParseIntPipe) id: number, @Body() request: OngiAdminUserTypeRequest) {
    await this.directoryUseCase.grantType(actor, id, request.type);

    return new OngiAdminOkResponse();
  }

  @RequireOngiAdminPermission('directory')
  @RestApiGet(OngiAdminGroupListResponse, { path: '/groups', description: '가족 공간 목록 — ?q=이름·id, ?page=' })
  async groups(@Query('q') q?: string, @Query('page') page?: string) {
    return new OngiAdminGroupListResponse(await this.directoryUseCase.scanGroups(searchQuery(q), pageNumber(page)));
  }

  @RequireOngiAdminPermission('directory')
  @RestApiGet(OngiAdminGroupDetailResponse, { path: '/groups/:id', description: '가족 공간 상세 · 구성원' })
  async group(@Param('id', ParseIntPipe) id: number) {
    return new OngiAdminGroupDetailResponse(await this.directoryUseCase.getGroup(id));
  }

  @RequireOngiAdminPermission('photos')
  @RestApiGet(OngiAdminPhotoListResponse, { path: '/groups/:id/photos', description: '가족 공간 사진 열람 (열람 기록 남김) — ?page=' })
  async groupPhotos(@AdminActor() actor: OngiAdminActor, @Param('id', ParseIntPipe) id: number, @Query('page') page?: string) {
    return new OngiAdminPhotoListResponse(await this.photoUseCase.scanGroupPhotos(actor, id, pageNumber(page)));
  }

  @RequireOngiAdminPermission('photos')
  @RestApiGet(OngiAdminPhotoListResponse, { path: '/users/:id/photos', description: '사용자가 올린 사진 열람 (열람 기록 남김) — ?page=' })
  async userPhotos(@AdminActor() actor: OngiAdminActor, @Param('id', ParseIntPipe) id: number, @Query('page') page?: string) {
    return new OngiAdminPhotoListResponse(await this.photoUseCase.scanUserPhotos(actor, id, pageNumber(page)));
  }

  @RequireOngiAdminPermission('photos')
  @RestApiGet(OngiAdminAccessLogListResponse, { path: '/access-logs', description: '운영자 사진 열람 기록 — ?page=' })
  async accessLogs(@Query('page') page?: string) {
    return new OngiAdminAccessLogListResponse(await this.photoUseCase.scanAccessLogs(pageNumber(page)));
  }

  @RequireOngiAdminPermission('configs')
  @RestApiGet(OngiAdminConfigListResponse, { path: '/configs', description: '앱 버전 설정' })
  async configs() {
    return new OngiAdminConfigListResponse(await this.configUseCase.scan());
  }

  @RequireOngiAdminPermission('configs')
  @RestApiPut(OngiAdminOkResponse, { path: '/configs', description: '앱 버전 설정 변경' })
  async setConfig(@Body() request: OngiAdminConfigRequest) {
    await this.configUseCase.update(request.key, request.value.trim());

    return new OngiAdminOkResponse();
  }
}
