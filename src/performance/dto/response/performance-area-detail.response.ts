import { ApiProperty } from '@nestjs/swagger';
import { PerformanceArea } from '@/performance/performance-area.entity';

export class PerformanceAreaDetailResponse {
  @ApiProperty({ type: 'number', required: true, description: '공연장 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '공연장 이름', example: '예술의전당' })
  name: string;

  @ApiProperty({ type: 'string', required: true, description: '공연 주소', example: '서울시 서초구 방배동 1430' })
  address: string;

  @ApiProperty({ type: 'number', required: true, description: '위도', example: 123.456 })
  latitude: number;

  @ApiProperty({ type: 'number', required: true, description: '경도', example: 123.456 })
  longitude: number;

  @ApiProperty({ type: 'number', required: true, description: '좌석 수', example: 123 })
  seatScale: number;

  @ApiProperty({ type: 'string | null', required: false, description: '공연장 홈페이지 주소', example: 'https://artinfokorea.com' })
  siteUrl: string | null;

  @ApiProperty({ type: 'string', required: true, description: '공연장 타입', example: '국립' })
  type: string;

  constructor(area: PerformanceArea) {
    this.id = area.id;
    this.name = area.name;
    this.address = area.address;
    this.latitude = area.latitude;
    this.longitude = area.longitude;
    this.seatScale = area.seatScale;
    this.siteUrl = area.siteUrl;
    this.type = area.type;
  }
}
