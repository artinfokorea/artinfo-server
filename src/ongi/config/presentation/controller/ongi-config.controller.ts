import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OngiGetAppConfigUseCase } from '@/ongi/config/application/usecase/ongi-config.usecase';
import { OngiAppConfigResponse } from '@/ongi/config/presentation/dto/response/ongi-app-config.response';

@RestApiController('/ongi', 'Ongi Config')
export class OngiConfigController {
  constructor(private readonly getAppConfigUseCase: OngiGetAppConfigUseCase) {}

  /** 앱 시작 시 버전 게이트용 — 로그인 전에 호출되므로 공개 엔드포인트 */
  @RestApiGet(OngiAppConfigResponse, { path: '/app-config', description: '앱 최소/최신 버전 (공개)' })
  async getAppConfig() {
    return new OngiAppConfigResponse(await this.getAppConfigUseCase.execute());
  }
}
