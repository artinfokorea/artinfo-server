import { ApiProperty } from '@nestjs/swagger';
import { PerformanceAreaResponse } from '@/performance/dto/response/performance-area.response';
import { PerformanceArea } from '@/performance/performance-area.entity';

export class PerformanceAreasResponse {
  @ApiProperty({ type: [PerformanceAreaResponse], required: true, description: '공연장 목록' })
  performanceAreas: PerformanceAreaResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ performanceAreas, totalCount }: { performanceAreas: PerformanceArea[]; totalCount: number }) {
    this.performanceAreas = performanceAreas.map(area => new PerformanceAreaResponse(area));
    this.totalCount = totalCount;
  }
}
