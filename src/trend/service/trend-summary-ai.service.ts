import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { FetchedArticle } from '@/trend/service/trend-news.fetcher';
import { TrendAiNotConfigured, TrendSummaryFailed } from '@/trend/exception/trend.exception';

export interface AiSummary {
  headline: string;
  summary: string;
  bullets: string[];
}

// 가성비 기준 기본 모델. 기사 10개 본문(~1.5만 토큰)을 넣어도 호출당 1~2원 수준.
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

@Injectable()
export class TrendSummaryAiService {
  private readonly logger = new Logger(TrendSummaryAiService.name);
  private readonly genAI: GoogleGenerativeAI | null;
  readonly modelName: string;

  constructor() {
    const apiKey = process.env['TREND_GOOGLE_AI_API_KEY'] || process.env['GOOGLE_AI_API_KEY'] || '';
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.modelName = process.env['TREND_AI_MODEL'] || DEFAULT_MODEL;
  }

  async summarize(keyword: string, articles: FetchedArticle[]): Promise<AiSummary> {
    if (!this.genAI) throw new TrendAiNotConfigured();

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            headline: { type: SchemaType.STRING },
            summary: { type: SchemaType.STRING },
            bullets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          required: ['headline', 'summary', 'bullets'],
        },
        maxOutputTokens: 1024,
        temperature: 0.3,
      },
    });

    const text = await this.callWithRetry(() =>
      model.generateContent({
        systemInstruction: this.systemPrompt(),
        contents: [{ role: 'user', parts: [{ text: this.userPrompt(keyword, articles) }] }],
      }),
    );

    try {
      const parsed = JSON.parse(text);
      return {
        headline: String(parsed.headline ?? '').trim(),
        summary: String(parsed.summary ?? '').trim(),
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets.map(String).filter(Boolean).slice(0, 5) : [],
      };
    } catch (e) {
      this.logger.error(`AI 응답 파싱 실패: ${text.slice(0, 200)}`);
      throw new TrendSummaryFailed();
    }
  }

  private systemPrompt(): string {
    return [
      '당신은 한국 포털 실시간 검색어 해설 기자입니다.',
      '주어진 키워드가 지금 왜 실시간 검색 순위에 올랐는지, 제공된 기사들만 근거로 한국어로 설명합니다.',
      '규칙:',
      '- 기사에 없는 내용은 추측하거나 지어내지 마세요.',
      '- 여러 기사가 같은 사건을 다루면 하나로 묶고, 서로 다른 이슈가 섞여 있으면 가장 많이 다뤄진 이슈를 중심으로 설명하되 다른 이슈도 짧게 언급하세요.',
      '- headline: 15자 내외의 한 줄 제목 (이슈의 핵심).',
      '- summary: 2~3문장. 첫 문장은 "무슨 일이 있었는지", 이어서 "왜 관심이 쏠렸는지".',
      '- bullets: 핵심 사실 3~5개, 각 40자 이내. 숫자·날짜·인물 등 구체 정보 위주.',
      '- 존댓말이 아닌 기사체(~했다, ~이다)로 작성합니다.',
    ].join('\n');
  }

  private userPrompt(keyword: string, articles: FetchedArticle[]): string {
    const items = articles
      .map((a, i) => {
        const when = a.publishedAt ? new Date(a.publishedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '시각 미상';
        const content = a.body || a.snippet || '(본문 없음)';
        return `[기사 ${i + 1}] ${a.title}\n언론사: ${a.press} | 발행: ${when}\n${content}`;
      })
      .join('\n\n');
    return `키워드: "${keyword}"\n현재 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n\n아래 ${articles.length}개 기사를 종합해 이 키워드가 왜 순위에 올랐는지 요약하세요.\n\n${items}`;
  }

  private async callWithRetry(fn: () => Promise<{ response: { text: () => string } }>, maxRetries = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fn();
        const text = response.response.text();
        if (!text) throw new Error('Google AI 응답이 비어있습니다');
        return text;
      } catch (e: any) {
        const msg: string = e?.message ?? '';
        const isRetryable = msg.includes('503') || msg.includes('429') || msg.includes('high demand');
        if (isRetryable && attempt < maxRetries) {
          const delay = attempt * 2000;
          this.logger.warn(`Google AI 재시도 ${attempt}/${maxRetries} (${delay}ms 후)`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        this.logger.error(`Google AI 호출 실패: ${msg}`);
        throw new TrendSummaryFailed();
      }
    }
    throw new TrendSummaryFailed();
  }
}
