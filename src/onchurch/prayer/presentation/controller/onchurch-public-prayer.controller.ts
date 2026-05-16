import { Body, Param } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { OnchurchSubmitPublicPrayerUseCase } from '@/onchurch/prayer/application/usecase/onchurch-submit-public-prayer.usecase';
import { OnchurchPrayerSubmitRequest } from '@/onchurch/prayer/presentation/dto/request/onchurch-prayer-submit.request';
import { OnchurchPrayerResponse } from '@/onchurch/prayer/presentation/dto/response/onchurch-prayer.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicPrayerController {
  constructor(private readonly submitUseCase: OnchurchSubmitPublicPrayerUseCase) {}

  @RestApiPost(OnchurchPrayerResponse, { path: '/:slug/prayers', description: '공개 - 익명/실명 기도 요청 등록' })
  async submit(@Param('slug') slug: string, @Body() request: OnchurchPrayerSubmitRequest) {
    const isAnonymous = !!request.isAnonymous;
    const item = await this.submitUseCase.execute(slug, {
      name: isAnonymous ? null : (request.name ?? '').trim() || null,
      contact: (request.contact ?? '').trim() || null,
      category: request.category.trim(),
      scope: request.scope.trim(),
      content: request.content,
      isAnonymous,
    });
    return new OnchurchPrayerResponse(item);
  }
}
