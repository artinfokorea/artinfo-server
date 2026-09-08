import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { SalpyeoScanVerticalsUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-scan-verticals.usecase';
import { SalpyeoGetVerticalUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-get-vertical.usecase';
import { SalpyeoVerticalResponse, SalpyeoVerticalsResponse } from '@/salpyeo/facility/presentation/dto/response/salpyeo-vertical.response';

/** 살펴 API 는 전부 공개 (로그인 없이 가격·평가 열람) */
@RestApiController('/salpyeo/verticals', 'Salpyeo Vertical')
export class SalpyeoVerticalController {
  constructor(
    private readonly scanVerticalsUseCase: SalpyeoScanVerticalsUseCase,
    private readonly getVerticalUseCase: SalpyeoGetVerticalUseCase,
  ) {}

  @RestApiGet(SalpyeoVerticalsResponse, { path: '', description: '시설 종류 목록 (활성 여부·시설 수 포함)' })
  async scan() {
    return new SalpyeoVerticalsResponse(await this.scanVerticalsUseCase.execute());
  }

  @RestApiGet(SalpyeoVerticalResponse, { path: '/:key', description: '시설 종류 단건' })
  async get(@Param('key') key: string) {
    return new SalpyeoVerticalResponse(await this.getVerticalUseCase.execute(key));
  }
}
