import { Get, Param, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OngiGetLegalDocUseCase } from '@/ongi/legal/application/usecase/ongi-legal.usecase';
import { OngiLegalDocResponse } from '@/ongi/legal/presentation/dto/response/ongi-legal.response';
import { renderOngiLegalHtml } from '@/ongi/legal/presentation/view/ongi-legal.html';

@RestApiController('/ongi/legal', 'Ongi Legal')
export class OngiLegalController {
  constructor(private readonly getLegalDocUseCase: OngiGetLegalDocUseCase) {}

  /**
   * 공개 HTML — App Store Connect 개인정보 처리방침 URL 용 (예: /ongi/legal/privacy.html).
   * `/:slug` 보다 먼저 선언해야 "privacy.html" 이 slug 로 잡히지 않는다.
   * @Res 를 직접 쓰므로 전역 ResponseInterceptor 의 JSON 봉투를 타지 않는다.
   */
  @ApiExcludeEndpoint()
  @Get('/:slug.html')
  getLegalDocHtml(@Param('slug') slug: string, @Res() res: Response) {
    const doc = this.getLegalDocUseCase.execute(slug);

    res.type('html').send(renderOngiLegalHtml(doc));
  }

  /** 로그인 전에도 열람 가능해야 하므로 공개 엔드포인트 */
  @RestApiGet(OngiLegalDocResponse, { path: '/:slug', description: '약관·정책 문서 조회 (공개)' })
  async getLegalDoc(@Param('slug') slug: string) {
    const doc = this.getLegalDocUseCase.execute(slug);

    return new OngiLegalDocResponse(doc);
  }
}
