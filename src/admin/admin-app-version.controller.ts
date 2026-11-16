import { Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RestApiController } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { ArtinfoAdminGuard } from '@/admin/guard/artinfo-admin.guard';
import { AppVersionService } from '@/app-version/app-version.service';
import { AdminAppVersionsResponse } from '@/app-version/dto/app-version.response';
import { SaveAppVersionRequest } from '@/app-version/dto/app-version.request';

/** 아트인포 관리자 — 앱 최소 버전 관리 (ADMIN 만) */
@RestApiController('/admin/app-versions', 'Admin')
@UseGuards(ArtinfoAdminGuard)
@ApiBearerAuth()
export class AdminAppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Get('/')
  @ApiOperation({ summary: '관리자 — 플랫폼별 최소·최신 버전·안내 문구' })
  @ApiOkResponse({ type: AdminAppVersionsResponse })
  list(): Promise<AdminAppVersionsResponse> {
    return this.appVersionService.listForAdmin();
  }

  @Put('/:platform')
  @ApiOperation({ summary: '관리자 — 플랫폼(ios/android)의 최소·최신 버전·안내 문구 저장. 저장 후 전체 목록을 돌려준다' })
  @ApiParam({ name: 'platform', enum: ['ios', 'android'] })
  @ApiOkResponse({ type: AdminAppVersionsResponse })
  save(
    @AuthSignature() signature: UserSignature,
    @Param('platform') platform: string,
    @Body() request: SaveAppVersionRequest,
  ): Promise<AdminAppVersionsResponse> {
    return this.appVersionService.save(platform, request, signature.id);
  }
}
