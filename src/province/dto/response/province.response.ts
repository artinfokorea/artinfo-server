import { ApiProperty } from '@nestjs/swagger';
import { Province } from '@/lesson/entity/province.entity';

export class ProvinceResponse {
  @ApiProperty({ type: 'number', required: true, description: '행정 구역 아이디', example: 5 })
  id: number;

  @ApiProperty({ type: 'number', required: true, description: '행정 구역 분류', example: 1 })
  depth: number;

  @ApiProperty({ type: 'string', required: true, description: '행정 구역 이름', example: '서울특별시' })
  name: string;

  constructor(province: Province) {
    this.id = province.id;
    this.depth = province.depth;
    this.name = province.name;
  }
}
