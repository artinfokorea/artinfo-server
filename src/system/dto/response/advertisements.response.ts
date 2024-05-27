import { ApiProperty } from '@nestjs/swagger';
import { Advertisement } from '@/system/entity/advertisement.entity';
import { AdvertisementResponse } from '@/system/dto/response/advertisement.response';

export class AdvertisementsResponse {
  @ApiProperty({ type: [AdvertisementResponse], required: true, description: '광고 목록' })
  advertisements: AdvertisementResponse[];

  constructor(advertisements: Advertisement[]) {
    this.advertisements = advertisements.map(advertisement => new AdvertisementResponse(advertisement));
  }
}
