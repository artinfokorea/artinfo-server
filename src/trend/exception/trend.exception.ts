import { HttpException, HttpStatus } from '@nestjs/common';

export class TrendNoArticlesFound extends HttpException {
  constructor() {
    super({ code: 'TREND-001', message: '해당 키워드로 수집된 뉴스가 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}

export class TrendSummaryInProgress extends HttpException {
  constructor() {
    super({ code: 'TREND-002', message: '요약을 생성 중입니다. 잠시 후 다시 시도해주세요.' }, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class TrendAiNotConfigured extends HttpException {
  constructor() {
    super(
      { code: 'TREND-003', message: 'AI API 키가 설정되지 않았습니다. (OPENAI_API_KEY 또는 TREND_AI_PROVIDER=gemini + GOOGLE_AI_API_KEY)' },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class TrendSummaryFailed extends HttpException {
  constructor() {
    super({ code: 'TREND-004', message: 'AI 요약 생성에 실패했습니다.' }, HttpStatus.BAD_GATEWAY);
  }
}
