import { ApiProperty } from '@nestjs/swagger';
import { Performance } from '@/performance/performance.entity';

export class PerformanceResponse {
  @ApiProperty({ type: 'number', required: true, description: '공연 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '공연 제목', example: '국립합창단 제 126회 정기연주회' })
  title: string;

  @ApiProperty({ type: 'string', required: true, description: '공연 포스터 이미지 주소', example: 'https://artinfokorea.com' })
  posterImageUrl: string;

  @ApiProperty({ type: 'date', required: true, description: '공연 시작일', example: new Date() })
  startAt: Date;

  @ApiProperty({ type: 'date', required: true, description: '공연 종료일', example: new Date() })
  endAt: Date;

  constructor(performance: Performance) {
    this.id = performance.id;
    this.title = performance.title;
    this.posterImageUrl = performance.posterImageUrl;
    this.startAt = performance.startAt;
    this.endAt = performance.endAt;
  }
}
