import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchListPublicSermonsUseCase } from '@/onchurch/sermon/application/usecase/onchurch-list-public-sermons.usecase';
import { OnchurchPublicSermonResponse } from '@/onchurch/sermon/presentation/dto/response/onchurch-sermon.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicSermonController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicSermonsUseCase) {}

  @RestApiGet(OnchurchPublicSermonResponse, { path: '/:slug/sermons', description: '공개 - 교회 설교 (시리즈 + 설교 목록)' })
  async listPublic(@Param('slug') slug: string) {
    const view = await this.listPublicUseCase.execute(slug);
    return new OnchurchPublicSermonResponse(view);
  }
}
