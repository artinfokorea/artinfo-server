import { Body, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OnchurchAppVersionService } from '@/onchurch/app-version/onchurch-app-version.service';
import {
  OnchurchAppVersionCheckResponse,
  OnchurchMasterAppVersionsResponse,
  OnchurchSaveAppVersionRequest,
} from '@/onchurch/app-version/onchurch-app-version.dto';

/** 온교회 앱 기동 시 호출 — 인증 없음 */
@RestApiController('/onchurch/app', 'Onchurch App')
export class OnchurchAppVersionController {
  constructor(private readonly appVersionService: OnchurchAppVersionService) {}

  @RestApiGet(OnchurchAppVersionCheckResponse, {
    path: '/version',
    description: '온교회 앱 최소·최신 버전 확인 — version 을 보내면 updateRequired/updateAvailable 을 판정해 준다',
  })
  @ApiQuery({ name: 'platform', required: true, enum: ['ios', 'android'] })
  @ApiQuery({ name: 'version', required: false, type: String, description: '앱의 현재 버전 (예: 1.0.0)' })
  check(@Query('platform') platform?: string, @Query('version') version?: string): Promise<OnchurchAppVersionCheckResponse> {
    return this.appVersionService.check(platform, version);
  }
}

/** 온교회 마스터 — 앱 버전 관리 (마스터만) */
@RestApiController('/onchurch/master/app-versions', 'Onchurch Master')
export class OnchurchMasterAppVersionController {
  constructor(private readonly appVersionService: OnchurchAppVersionService) {}

  @RestApiGet(OnchurchMasterAppVersionsResponse, { path: '/', description: '마스터 — 플랫폼별 최소·최신 버전·안내 문구·스토어 주소', auth: [USER_TYPE.CLIENT] })
  list(@AuthSignature() signature: UserSignature): Promise<OnchurchMasterAppVersionsResponse> {
    return this.appVersionService.listForMaster(signature.id);
  }

  @RestApiPut(OnchurchMasterAppVersionsResponse, {
    path: '/:platform',
    description: '마스터 — 플랫폼(ios/android)의 최소·최신 버전·안내 문구·스토어 주소 저장. 저장 후 전체 목록을 돌려준다',
    auth: [USER_TYPE.CLIENT],
  })
  @ApiParam({ name: 'platform', enum: ['ios', 'android'] })
  save(
    @AuthSignature() signature: UserSignature,
    @Param('platform') platform: string,
    @Body() request: OnchurchSaveAppVersionRequest,
  ): Promise<OnchurchMasterAppVersionsResponse> {
    return this.appVersionService.save(signature.id, platform, request);
  }
}
