import { ApiProperty } from '@nestjs/swagger';
import { OngiAppConfig } from '@/ongi/config/application/usecase/ongi-config.usecase';

export class OngiAppConfigResponse {
  @ApiProperty({ type: String, description: '지원하는 최소 iOS 앱 버전 — 미만이면 강제 업데이트' })
  minIosVersion: string;

  @ApiProperty({ type: String, description: '최신 iOS 앱 버전' })
  latestIosVersion: string;

  @ApiProperty({ type: String, description: 'App Store 링크' })
  storeUrl: string;

  constructor(config: OngiAppConfig) {
    this.minIosVersion = config.minIosVersion;
    this.latestIosVersion = config.latestIosVersion;
    this.storeUrl = config.storeUrl;
  }
}
