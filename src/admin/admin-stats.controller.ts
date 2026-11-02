import { Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RestApiController } from '@/common/decorator/rest-api';
import { ArtinfoAdminGuard } from '@/admin/guard/artinfo-admin.guard';
import { AdminStatsService } from '@/admin/admin-stats.service';
import { AdminBreakdownResponse, AdminDailyResponse, AdminOverviewResponse } from '@/admin/dto/admin-stats.response';

/** 아트인포 관리자 지표 — users.type 이 ADMIN 인 사용자만 (ArtinfoAdminGuard 가 DB 로 확인) */
@RestApiController('/admin/stats', 'Admin')
@UseGuards(ArtinfoAdminGuard)
@ApiBearerAuth()
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get('/overview')
  @ApiOperation({ summary: '관리자 — 전체/최근 7·30일 요약 지표' })
  @ApiOkResponse({ type: AdminOverviewResponse })
  overview(): Promise<AdminOverviewResponse> {
    return this.adminStatsService.overview();
  }

  @Get('/daily')
  @ApiOperation({ summary: '관리자 — 일별 가입·로그인·채용·글·댓글 (한국 날짜, 기본 30일, 7~90일)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiOkResponse({ type: AdminDailyResponse })
  daily(@Query('days') days?: string): Promise<AdminDailyResponse> {
    return this.adminStatsService.daily(days === undefined ? undefined : Number(days));
  }

  @Get('/breakdown')
  @ApiOperation({ summary: '관리자 — 로그인 방식·채용 유형 분포, 최근 가입, 인기 글, 최근 문의' })
  @ApiOkResponse({ type: AdminBreakdownResponse })
  breakdown(): Promise<AdminBreakdownResponse> {
    return this.adminStatsService.breakdown();
  }
}
