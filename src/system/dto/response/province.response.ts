import { ApiProperty } from '@nestjs/swagger';
import { PROVINCE_TYPE } from '@/system/entity/province';

export class ProvinceResponse {
  @ApiProperty({ enum: PROVINCE_TYPE, enumName: 'PROVINCE_TYPE', required: true, description: '행정 구역 ENUM 키', example: PROVINCE_TYPE.JEJU })
  key: PROVINCE_TYPE;

  @ApiProperty({ type: 'string', required: true, description: '한국어 이름', example: '서울' })
  value: string;

  constructor({ key, value }: { key: PROVINCE_TYPE; value: string }) {
    this.key = key;
    this.value = value;
  }
}
