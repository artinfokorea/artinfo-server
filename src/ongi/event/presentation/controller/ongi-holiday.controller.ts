import { Query } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OngiScanHolidaysUseCase } from '@/ongi/event/application/usecase/ongi-holiday.usecase';
import { OngiInvalidEventDate } from '@/ongi/event/domain/exception/ongi-event.exception';
import { OngiHolidayListResponse } from '@/ongi/event/presentation/dto/response/ongi-holiday.response';

@RestApiController('/ongi', 'Ongi Holiday')
export class OngiHolidayController {
  constructor(private readonly scanHolidaysUseCase: OngiScanHolidaysUseCase) {}

  @RestApiGet(OngiHolidayListResponse, {
    path: '/holidays',
    description: '한국 공휴일 — 연도별 규칙 계산 + 임시공휴일(extra_holidays)',
    auth: [USER_TYPE.CLIENT],
  })
  async holidays(@Query('year') yearRaw: string) {
    const year = Number(yearRaw);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) throw new OngiInvalidEventDate();

    return new OngiHolidayListResponse(await this.scanHolidaysUseCase.execute(year));
  }
}
