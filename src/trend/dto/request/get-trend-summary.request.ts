import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const TREND_REGIONS = ['kr'] as const;
export type TrendRegion = (typeof TREND_REGIONS)[number];

export class GetTrendSummaryRequest {
  @ApiProperty({ description: '실시간 검색어 키워드', example: '손흥민' })
  @IsNotEmpty({ message: '키워드는 필수입니다.' })
  @IsString()
  @MaxLength(50, { message: '키워드는 50자 이하여야 합니다.' })
  keyword: string;

  @ApiProperty({ description: '지역 코드', example: 'kr', required: false, enum: TREND_REGIONS })
  @IsOptional()
  @IsIn(TREND_REGIONS)
  region: TrendRegion = 'kr';

  @ApiProperty({ description: '요약에 사용할 기사 수 (1~15)', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(15)
  limit: number = 10;
}
