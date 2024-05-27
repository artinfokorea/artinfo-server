import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { AdvertisementService } from '@/system/service/advertisement.service';
import { AdvertisementResponse } from '@/system/dto/response/advertisement.response';
import { Query } from '@nestjs/common';
import { AdvertisementsRequest } from '@/system/dto/request/advertisements.request';
import { AdvertisementsResponse } from '@/system/dto/response/advertisements.response';

@RestApiController('/advertisements', 'Advertisement')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @RestApiGet(AdvertisementsResponse, { path: '/', description: '광고 전체 조회' })
  async getAdvertisements(@Query() request: AdvertisementsRequest) {
    const advertisements = await this.advertisementService.getAdvertisementsByType(request.type);

    return advertisements.map(advertisement => new AdvertisementResponse(advertisement));
  }
}
