import { Param, Query } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchListPublicEventsUseCase } from '@/onchurch/event/application/usecase/onchurch-list-public-events.usecase';
import { OnchurchEventListResponse } from '@/onchurch/event/presentation/dto/response/onchurch-event.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicEventController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicEventsUseCase) {}

  @RestApiGet(OnchurchEventListResponse, { path: '/:slug/events', description: '공개 - 특정 교회의 활성 일정 목록 (선택적 from/to 범위)' })
  async listPublic(
    @Param('slug') slug: string,
    @Query('from') fromRaw?: string,
    @Query('to') toRaw?: string,
  ) {
    const from = fromRaw ? new Date(fromRaw) : null;
    const to = toRaw ? new Date(toRaw) : null;
    const events = await this.listPublicUseCase.execute(slug, {
      from: from && !Number.isNaN(from.getTime()) ? from : null,
      to: to && !Number.isNaN(to.getTime()) ? to : null,
    });
    return new OnchurchEventListResponse(events);
  }
}
