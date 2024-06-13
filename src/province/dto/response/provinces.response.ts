import { ApiProperty } from '@nestjs/swagger';
import { ProvinceResponse } from '@/province/dto/response/province.response';
import { Province } from '@/lesson/entity/province.entity';

export class ProvincesResponse {
  @ApiProperty({ type: [ProvinceResponse], required: true, description: '행정 구역 목록' })
  provinces: ProvinceResponse[];

  constructor(provinces: Province[]) {
    this.provinces = provinces.map(province => new ProvinceResponse(province));
  }
}
