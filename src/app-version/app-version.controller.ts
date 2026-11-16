import { Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RestApiController } from '@/common/decorator/rest-api';
import { AppVersionService } from '@/app-version/app-version.service';
import { AppVersionCheckResponse } from '@/app-version/dto/app-version.response';

/** 앱 기동 시 호출 — 인증 없음 */
@RestApiController('/app', 'App')
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Get('/version')
  @ApiOperation({ summary: '앱 최소·최신 버전 확인 — version 을 보내면 updateRequired/updateAvailable 을 판정해 준다' })
  @ApiQuery({ name: 'platform', required: true, enum: ['ios', 'android'] })
  @ApiQuery({ name: 'version', required: false, type: String, description: '앱의 현재 버전 (예: 1.1)' })
  @ApiOkResponse({ type: AppVersionCheckResponse })
  check(@Query('platform') platform?: string, @Query('version') version?: string): Promise<AppVersionCheckResponse> {
    return this.appVersionService.check(platform, version);
  }
}
