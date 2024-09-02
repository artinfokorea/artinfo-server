import { ApiProperty } from '@nestjs/swagger';
import { PerformanceArea } from '@/performance/performance-area.entity';

export class PerformanceAreaResponse {
  @ApiProperty({ type: 'number', required: true, description: '공연장 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '공연장 이름', example: '예술의전당' })
  name: string;

  @ApiProperty({ type: 'string', required: true, description: '공연 주소', example: '서울시 서초구 방배동 1430' })
  address: string;

  constructor(area: PerformanceArea) {
    this.id = area.id;
    this.name = area.name;
    this.address = area.address;
  }
}
