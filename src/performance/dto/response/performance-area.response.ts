import { ApiProperty } from '@nestjs/swagger';
import { PerformanceArea } from '@/performance/performance-area.entity';

export class PerformanceAreaResponse {
  @ApiProperty({ type: 'string', required: true, description: '공연장 이름', example: '예술의전당 [서울] 콘서트홀' })
  name: string;

  @ApiProperty({ type: 'number', required: true, description: '좌석수', example: 2505 })
  seatScale: number;

  @ApiProperty({ type: 'string', required: true, description: '시설특성', example: '국립' })
  type: string;

  @ApiProperty({ type: 'string', required: true, description: '주소', example: '서울특별시 서초구 남부수놘로 2406 (서초동)' })
  address: string;

  @ApiProperty({ type: 'number', required: true, description: '위도', example: 16 })
  latitude: number;

  @ApiProperty({ type: 'number', required: true, description: '경도', example: 16 })
  longitude: number;

  @ApiProperty({ type: 'string | null', required: false, description: '홈페이지', example: 'www.artinfokorea.com' })
  siteUrl: string | null;

  constructor(performanceArea: PerformanceArea) {
    this.name = performanceArea.name;
    this.seatScale = performanceArea.seatScale;
    this.type = performanceArea.type;
    this.address = performanceArea.address;
    this.latitude = performanceArea.latitude;
    this.longitude = performanceArea.longitude;
    this.siteUrl = performanceArea.siteUrl;
  }
}
