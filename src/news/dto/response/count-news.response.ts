import { ApiProperty } from '@nestjs/swagger';

export class CountNewsResponse {
  @ApiProperty({ type: 'number', required: true, description: '뉴스 개수', example: 2 })
  totalCount: number;

  constructor(totalCount: number) {
    this.totalCount = totalCount;
  }
}
