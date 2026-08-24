import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const TREND_REACTIONS = ['surprised', 'angry', 'cheer', 'hmm'] as const;
export type TrendReaction = (typeof TREND_REACTIONS)[number];

export class GetTrendReactionsRequest {
  @ApiProperty({ description: '실시간 검색어 키워드', example: '손흥민' })
  @IsNotEmpty({ message: '키워드는 필수입니다.' })
  @IsString()
  @MaxLength(50, { message: '키워드는 50자 이하여야 합니다.' })
  keyword: string;
}

export class AddTrendReactionRequest {
  @ApiProperty({ description: '실시간 검색어 키워드', example: '손흥민' })
  @IsNotEmpty({ message: '키워드는 필수입니다.' })
  @IsString()
  @MaxLength(50, { message: '키워드는 50자 이하여야 합니다.' })
  keyword: string;

  @ApiProperty({ description: '반응 — surprised(놀라움)·angry(화남)·cheer(응원)·hmm(글쎄)', enum: TREND_REACTIONS })
  @IsIn(TREND_REACTIONS)
  reaction: TrendReaction;

  @ApiProperty({ description: '기존 반응을 바꾸는 경우 이전 반응 (카운트에서 차감)', enum: TREND_REACTIONS, required: false })
  @IsOptional()
  @IsIn(TREND_REACTIONS)
  previous?: TrendReaction;
}
