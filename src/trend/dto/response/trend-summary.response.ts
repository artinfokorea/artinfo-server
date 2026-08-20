import { ApiProperty } from '@nestjs/swagger';

export class TrendSummaryArticle {
  @ApiProperty({ description: '기사 제목' })
  title: string;

  @ApiProperty({ description: '언론사' })
  press: string;

  @ApiProperty({ description: '기사 링크' })
  link: string;

  @ApiProperty({ description: '발행 시각 (ISO 8601)', nullable: true })
  publishedAt: string | null;

  @ApiProperty({ description: '본문 수집 성공 여부 (false면 검색 스니펫만 사용)' })
  hasBody: boolean;
}

export class TrendSummaryResponse {
  @ApiProperty({ description: '키워드', example: '손흥민' })
  keyword: string;

  @ApiProperty({ description: '지역', example: 'kr' })
  region: string;

  @ApiProperty({ description: '이슈 한 줄 헤드라인', example: '손흥민, LAFC 데뷔전서 결승골' })
  headline: string;

  @ApiProperty({ description: '왜 순위에 올랐는지 2~3문장 요약' })
  summary: string;

  @ApiProperty({ description: '핵심 포인트', type: [String] })
  bullets: string[];

  @ApiProperty({ description: '요약 근거가 된 기사 목록', type: [TrendSummaryArticle] })
  articles: TrendSummaryArticle[];

  @ApiProperty({ description: '사용된 AI 모델', example: 'gemini-2.5-flash-lite' })
  model: string;

  @ApiProperty({ description: '생성 시각 (ISO 8601)' })
  generatedAt: string;

  @ApiProperty({ description: '캐시에서 반환되었는지 여부' })
  cached: boolean;

  constructor(data: TrendSummaryResponse) {
    Object.assign(this, data);
  }
}
