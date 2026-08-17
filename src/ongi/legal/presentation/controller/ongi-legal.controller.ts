import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OngiGetLegalDocUseCase } from '@/ongi/legal/application/usecase/ongi-legal.usecase';
import { OngiLegalDocResponse } from '@/ongi/legal/presentation/dto/response/ongi-legal.response';

@RestApiController('/ongi/legal', 'Ongi Legal')
export class OngiLegalController {
  constructor(private readonly getLegalDocUseCase: OngiGetLegalDocUseCase) {}

  /** 로그인 전에도 열람 가능해야 하므로 공개 엔드포인트 */
  @RestApiGet(OngiLegalDocResponse, { path: '/:slug', description: '약관·정책 문서 조회 (공개)' })
  async getLegalDoc(@Param('slug') slug: string) {
    const doc = this.getLegalDocUseCase.execute(slug);

    return new OngiLegalDocResponse(doc);
  }
}
