import { ApiProperty } from '@nestjs/swagger';
import { Performance } from '@/performance/performance.entity';
import { PerformanceResponse } from '@/performance/dto/response/performance.response';

export class PerformancesResponse {
  @ApiProperty({ type: [PerformanceResponse], required: true, description: '공연 목록' })
  performances: PerformanceResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ performances, totalCount }: { performances: Performance[]; totalCount: number }) {
    this.performances = performances.map(performance => new PerformanceResponse(performance));
    this.totalCount = totalCount;
  }
}
