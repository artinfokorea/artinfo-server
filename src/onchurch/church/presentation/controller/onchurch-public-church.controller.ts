import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchGetPublicChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-get-public-church.usecase';
import { OnchurchListPublicChurchesUseCase } from '@/onchurch/church/application/usecase/onchurch-list-public-churches.usecase';
import {
  OnchurchChurchResponse,
  OnchurchPublicChurchListResponse,
} from '@/onchurch/church/presentation/dto/response/onchurch-church.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicChurchController {
  constructor(
    private readonly getPublicChurchUseCase: OnchurchGetPublicChurchUseCase,
    private readonly listPublicChurchesUseCase: OnchurchListPublicChurchesUseCase,
  ) {}

  @RestApiGet(OnchurchPublicChurchListResponse, { path: '', description: '공개 - 운영 중인 교회 목록' })
  async list() {
    const churches = await this.listPublicChurchesUseCase.execute();
    return new OnchurchPublicChurchListResponse(churches);
  }

  @RestApiGet(OnchurchChurchResponse, { path: '/:slug', description: '공개 - 운영 중인 교회 메타데이터 (404 if not found or not published)' })
  async getPublic(@Param('slug') slug: string) {
    const church = await this.getPublicChurchUseCase.execute(slug);
    return new OnchurchChurchResponse(church);
  }
}
