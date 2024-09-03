import { ApiProperty } from '@nestjs/swagger';

export class CountPerformancesResponse {
  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor(totalCount: number) {
    this.totalCount = totalCount;
  }
}
