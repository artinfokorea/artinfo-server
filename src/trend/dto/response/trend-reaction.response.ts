import { ApiProperty } from '@nestjs/swagger';
import { TrendReaction } from '@/trend/dto/request/trend-reaction.request';

export class TrendReactionsResponse {
  @ApiProperty({ description: '키워드', example: '손흥민' })
  keyword: string;

  @ApiProperty({
    description: '반응별 누적 수',
    example: { surprised: 12, angry: 3, cheer: 41, hmm: 7 },
  })
  counts: Record<TrendReaction, number>;

  @ApiProperty({ description: '전체 반응 수' })
  total: number;

  constructor(data: TrendReactionsResponse) {
    Object.assign(this, data);
  }
}
