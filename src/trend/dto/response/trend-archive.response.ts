import { ApiProperty } from '@nestjs/swagger';

export class TrendArchiveItem {
  @ApiProperty({ description: '기간 내 종합 순위 (점수순)' })
  rank: number;

  @ApiProperty({ description: '키워드' })
  keyword: string;

  @ApiProperty({ description: '기간 내 최고 순위' })
  peak: number;

  @ApiProperty({ description: '최고 순위 최초 도달 시각 (ISO 8601)' })
  peakAt: string;

  @ApiProperty({ description: '차트 최초 진입 시각 (ISO 8601)' })
  firstSeen: string;

  @ApiProperty({ description: '차트 마지막 관측 시각 (ISO 8601)' })
  lastSeen: string;

  @ApiProperty({ description: '차트 체류 표본 수 (≈ 분)' })
  samples: number;

  @ApiProperty({ description: '누적 점수 Σ(21 - 순위)' })
  score: number;

  @ApiProperty({ description: '기간 내 차트에 오른 날 수' })
  days: number;
}

export class TrendArchiveDay {
  @ApiProperty({ description: 'YYYY-MM-DD' })
  date: string;

  @ApiProperty({ description: '해당 일자 데이터 존재 여부' })
  hasData: boolean;
}

export class TrendArchiveHourlyTop {
  @ApiProperty({ description: '시각 (0~23, KST)' })
  hour: number;

  @ApiProperty({ description: '해당 시각대 1위 키워드' })
  keyword: string;
}

export class TrendArchiveResponse {
  @ApiProperty({ description: '시작일' })
  from: string;

  @ApiProperty({ description: '종료일 (포함)' })
  to: string;

  @ApiProperty({ type: [TrendArchiveDay] })
  days: TrendArchiveDay[];

  @ApiProperty({ type: [TrendArchiveItem] })
  items: TrendArchiveItem[];

  @ApiProperty({ description: '시각대별 1위 (단일 일자 조회 시에만)', type: [TrendArchiveHourlyTop] })
  hourlyTop: TrendArchiveHourlyTop[];

  @ApiProperty({ description: '생성 시각 (ISO 8601)' })
  generatedAt: string;

  constructor(data: TrendArchiveResponse) {
    Object.assign(this, data);
  }
}
