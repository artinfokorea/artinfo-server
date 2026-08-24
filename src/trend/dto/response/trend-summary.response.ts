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

export class TrendSummaryPerson {
  @ApiProperty({ description: '기사 표기 이름', example: '손흥민' })
  name: string;

  @ApiProperty({ description: '동명이인 구분 — 직업·소속·대표작', example: '축구선수, 前 토트넘·現 LAFC' })
  disambiguation: string;

  @ApiProperty({ description: '이번 이슈에서의 역할' })
  roleInIssue: string;

  @ApiProperty({ description: '영어 이름', nullable: true, example: 'Son Heung-min' })
  englishName: string | null;

  @ApiProperty({ description: '출생 — "YYYY년 M월 D일 (만 나이) · 출생지"', nullable: true })
  birth: string | null;

  @ApiProperty({ description: '신체 — "183cm · 78kg"', nullable: true })
  body: string | null;

  @ApiProperty({ description: '소속', nullable: true })
  affiliation: string | null;

  @ApiProperty({ description: '학력 (최종 학력부터)', type: [String] })
  education: string[];

  @ApiProperty({ description: '주요 경력 (최신순, 최대 5개)', type: [String] })
  career: string[];

  @ApiProperty({ description: 'AI 프로필 확신도', enum: ['high', 'medium', 'low'] })
  confidence: 'high' | 'medium' | 'low';
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

  @ApiProperty({ description: '이슈 중심 인물 프로필 (공인만, AI 생성, 0~3명)', type: [TrendSummaryPerson] })
  people: TrendSummaryPerson[];

  @ApiProperty({ description: '요약 근거가 된 기사 목록', type: [TrendSummaryArticle] })
  articles: TrendSummaryArticle[];

  @ApiProperty({ description: '사용된 AI 모델', example: 'gemini-2.5-flash-lite' })
  model: string;

  @ApiProperty({ description: '생성 시각 (ISO 8601)' })
  generatedAt: string;

  @ApiProperty({ description: '캐시에서 반환되었는지 여부' })
  cached: boolean;

  @ApiProperty({ description: '캐시 만료 후 이전 생성 이력을 대신 반환한 경우 true (백그라운드에서 새 요약 생성 중)', required: false })
  stale?: boolean;

  constructor(data: TrendSummaryResponse) {
    Object.assign(this, data);
  }
}
