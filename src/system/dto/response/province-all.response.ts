import { ApiProperty } from '@nestjs/swagger';
import { ProvinceResponse } from '@/system/dto/response/province.response';
import { PROVINCE_TYPE } from '@/system/entity/province';

export class ProvinceAllResponse {
  @ApiProperty({ type: [ProvinceResponse], required: true, description: '행정 구역' })
  province: ProvinceResponse[];

  constructor(province: { key: PROVINCE_TYPE; value: string }[]) {
    this.province = province.map(provinceEl => new ProvinceResponse({ key: provinceEl.key, value: provinceEl.value }));
  }
}
