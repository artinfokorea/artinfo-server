import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchGetPublicChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-get-public-church.usecase';
import { OnchurchListPublicChurchesUseCase } from '@/onchurch/church/application/usecase/onchurch-list-public-churches.usecase';
import { OnchurchGetLiveStatusUseCase } from '@/onchurch/church/application/usecase/onchurch-get-live-status.usecase';
import {
  OnchurchChurchResponse,
  OnchurchPublicChurchListResponse,
  OnchurchLiveStatusResponse,
} from '@/onchurch/church/presentation/dto/response/onchurch-church.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicChurchController {
  constructor(
    private readonly getPublicChurchUseCase: OnchurchGetPublicChurchUseCase,
    private readonly listPublicChurchesUseCase: OnchurchListPublicChurchesUseCase,
    private readonly getLiveStatusUseCase: OnchurchGetLiveStatusUseCase,
  ) {}

  @RestApiGet(OnchurchPublicChurchListResponse, { path: '/', description: '공개 - 운영 중인 교회 목록' })
  async list() {
    const churches = await this.listPublicChurchesUseCase.execute();
    return new OnchurchPublicChurchListResponse(churches);
  }

  @RestApiGet(OnchurchLiveStatusResponse, { path: '/:slug/live-status', description: '공개 - 교회 라이브 방송 상태 (폴링용, 유튜브 호출 없음)' })
  async liveStatus(@Param('slug') slug: string) {
    return new OnchurchLiveStatusResponse(await this.getLiveStatusUseCase.execute(slug));
  }

  @RestApiGet(OnchurchChurchResponse, { path: '/:slug', description: '공개 - 운영 중인 교회 메타데이터 (404 if not found or not published)' })
  async getPublic(@Param('slug') slug: string) {
    const church = await this.getPublicChurchUseCase.execute(slug);
    return new OnchurchChurchResponse(church);
  }
}
