import { ApiProperty } from '@nestjs/swagger';
import { OngiAppConfig } from '@/ongi/config/domain/service/ongi-app-config';

export class OngiAppConfigResponse {
  @ApiProperty({ type: String, description: "요청 플랫폼 — 'ios' | 'android'" })
  platform: string;

  @ApiProperty({ type: String, description: '요청 플랫폼의 최소 지원 버전 — 미만이면 강제 업데이트' })
  minVersion: string;

  @ApiProperty({ type: String, description: '요청 플랫폼의 최신 버전' })
  latestVersion: string;

  @ApiProperty({ type: String, description: '(구버전 호환) 초기 앱이 플랫폼 구분 없이 읽는 최소 버전 — 안드로이드 요청이면 안드로이드 값' })
  minIosVersion: string;

  @ApiProperty({ type: String, description: '(구버전 호환) 안드로이드 요청이면 안드로이드 값' })
  latestIosVersion: string;

  @ApiProperty({ type: String, description: '요청 플랫폼의 스토어 링크 (App Store / Play 스토어)' })
  storeUrl: string;

  constructor(config: OngiAppConfig) {
    this.platform = config.platform;
    this.minVersion = config.minVersion;
    this.latestVersion = config.latestVersion;
    this.minIosVersion = config.minIosVersion;
    this.latestIosVersion = config.latestIosVersion;
    this.storeUrl = config.storeUrl;
  }
}
