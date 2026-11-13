import { Body, Delete, Get, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RestApiController } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { OkResponse } from '@/common/response/ok.response';
import { ArtinfoAdminGuard } from '@/admin/guard/artinfo-admin.guard';
import { AdminUsersService } from '@/admin/admin-users.service';
import { AdminUsersResponse, AdminUsersSummaryResponse } from '@/admin/dto/admin-users.response';
import { UpdateAdminUserTypeRequest } from '@/admin/dto/admin-users.request';
import { ADMIN_USER_FILTERS } from '@/admin/domain/admin-users.policy';

/** 아트인포 관리자 — 회원 관리 (users.type 이 ADMIN 인 사용자만, ArtinfoAdminGuard 가 DB 로 확인) */
@RestApiController('/admin/users', 'Admin')
@UseGuards(ArtinfoAdminGuard)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('/summary')
  @ApiOperation({ summary: '관리자 — 회원 요약: 전체·7일 가입·앱 설치(iOS/Android)·채용 알림 켬/끔·기기 수·탈퇴' })
  @ApiOkResponse({ type: AdminUsersSummaryResponse })
  summary(): Promise<AdminUsersSummaryResponse> {
    return this.adminUsersService.summary();
  }

  @Get('/')
  @ApiOperation({ summary: '관리자 — 회원 목록 (필터·검색·페이지네이션, 가입 최신순)' })
  @ApiQuery({ name: 'filter', required: false, enum: ADMIN_USER_FILTERS, description: 'all(기본)·app·web·push_on·push_off·admin·withdrawn' })
  @ApiQuery({ name: 'q', required: false, type: String, description: '닉네임·이름·이메일 부분 일치' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '1부터 (기본 1)' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: '기본 20, 최대 100' })
  @ApiOkResponse({ type: AdminUsersResponse })
  list(@Query('filter') filter?: string, @Query('q') q?: string, @Query('page') page?: string, @Query('size') size?: string): Promise<AdminUsersResponse> {
    return this.adminUsersService.list({
      filter,
      query: q,
      page: page === undefined ? undefined : Number(page),
      size: size === undefined ? undefined : Number(size),
    });
  }

  @Put('/:id/type')
  @ApiOperation({ summary: '관리자 — 회원 역할 변경 (ADMIN ↔ CLIENT). 자기 자신은 불가' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: OkResponse })
  async changeType(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateAdminUserTypeRequest,
  ): Promise<OkResponse> {
    await this.adminUsersService.changeType(signature.id, id, request.type);
    return new OkResponse();
  }

  @Delete('/:id')
  @ApiOperation({ summary: '관리자 — 회원 탈퇴 처리 (익명화 + soft delete + 푸시 토큰 삭제). 자기 자신·관리자는 불가' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: OkResponse })
  async withdraw(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number): Promise<OkResponse> {
    await this.adminUsersService.withdraw(signature.id, id);
    return new OkResponse();
  }
}
