import { Headers, Query } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OngiGetAppConfigUseCase } from '@/ongi/config/application/usecase/ongi-config.usecase';
import { detectAppPlatform } from '@/ongi/config/domain/service/ongi-app-config';
import { OngiAppConfigResponse } from '@/ongi/config/presentation/dto/response/ongi-app-config.response';

@RestApiController('/ongi', 'Ongi Config')
export class OngiConfigController {
  constructor(private readonly getAppConfigUseCase: OngiGetAppConfigUseCase) {}

  /** 앱 시작 시 버전 게이트용 — 로그인 전에 호출되므로 공개 엔드포인트. ?platform=ios|android (없으면 User-Agent 로 판별) */
  @RestApiGet(OngiAppConfigResponse, { path: '/app-config', description: '앱 최소/최신 버전 (공개)' })
  async getAppConfig(@Query('platform') platform?: string, @Headers('user-agent') userAgent?: string) {
    return new OngiAppConfigResponse(await this.getAppConfigUseCase.execute(detectAppPlatform(platform, userAgent)));
  }
}
