import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { FetchedArticle } from '@/trend/service/trend-news.fetcher';
import { TrendAiNotConfigured, TrendSummaryFailed } from '@/trend/exception/trend.exception';

export interface AiSummary {
  headline: string;
  summary: string;
  bullets: string[];
}

type Provider = 'openai' | 'gemini';

// 기본 provider는 OpenAI(서버에 OPENAI_API_KEY가 이미 있음). TREND_AI_PROVIDER=gemini 로 전환 가능.
const DEFAULT_MODEL: Record<Provider, string> = {
  openai: 'gpt-5-mini',
  gemini: 'gemini-2.5-flash-lite',
};

const RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    summary: { type: 'string' },
    bullets: { type: 'array', items: { type: 'string' } },
  },
  required: ['headline', 'summary', 'bullets'],
  additionalProperties: false,
} as const;

@Injectable()
export class TrendSummaryAiService {
  private readonly logger = new Logger(TrendSummaryAiService.name);
  private readonly provider: Provider;
  private readonly openai: OpenAI | null = null;
  private readonly genAI: GoogleGenerativeAI | null = null;
  readonly modelName: string;

  constructor() {
    this.provider = process.env['TREND_AI_PROVIDER'] === 'gemini' ? 'gemini' : 'openai';
    this.modelName = process.env['TREND_AI_MODEL'] || DEFAULT_MODEL[this.provider];

    if (this.provider === 'openai') {
      const apiKey = process.env['TREND_OPENAI_API_KEY'] || process.env['OPENAI_API_KEY'];
      if (apiKey) this.openai = new OpenAI({ apiKey, maxRetries: 3, timeout: 60_000 });
    } else {
      const apiKey = process.env['TREND_GOOGLE_AI_API_KEY'] || process.env['GOOGLE_AI_API_KEY'];
      if (apiKey) this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async summarize(keyword: string, articles: FetchedArticle[]): Promise<AiSummary> {
    const system = this.systemPrompt();
    const user = this.userPrompt(keyword, articles);

    const text = this.provider === 'openai' ? await this.callOpenAi(system, user) : await this.callGemini(system, user);

    try {
      const parsed = JSON.parse(text);
      return {
        headline: String(parsed.headline ?? '').trim(),
        summary: String(parsed.summary ?? '').trim(),
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets.map(String).filter(Boolean).slice(0, 5) : [],
      };
    } catch {
      this.logger.error(`AI 응답 파싱 실패: ${text.slice(0, 200)}`);
      throw new TrendSummaryFailed();
    }
  }

  private async callOpenAi(system: string, user: string): Promise<string> {
    if (!this.openai) throw new TrendAiNotConfigured();
    try {
      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'trend_summary', strict: true, schema: RESPONSE_JSON_SCHEMA },
        },
        // gpt-5 계열은 reasoning 토큰이 이 한도를 함께 소모하므로 넉넉히 잡고 추론 강도는 낮춘다
        max_completion_tokens: 16000,
        reasoning_effort: 'low',
      });
      const choice = response.choices[0];
      const content = choice?.message?.content;
      if (!content) {
        throw new Error(`OpenAI 응답이 비어있습니다 (finish_reason=${choice?.finish_reason ?? 'unknown'}, refusal=${choice?.message?.refusal ?? 'none'})`);
      }
      return content;
    } catch (e: any) {
      const detail: string = e?.error?.message ?? e?.message ?? String(e);
      this.logger.error(`OpenAI 호출 실패 (${this.modelName}): ${detail}`);
      throw new TrendSummaryFailed(detail);
    }
  }

  private async callGemini(system: string, user: string): Promise<string> {
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

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await model.generateContent({
          systemInstruction: system,
          contents: [{ role: 'user', parts: [{ text: user }] }],
        });
        const text = response.response.text();
        if (!text) throw new Error('Google AI 응답이 비어있습니다');
        return text;
      } catch (e: any) {
        const msg: string = e?.message ?? '';
        const isRetryable = msg.includes('503') || msg.includes('429') || msg.includes('high demand');
        if (isRetryable && attempt < 3) {
          const delay = attempt * 2000;
          this.logger.warn(`Google AI 재시도 ${attempt}/3 (${delay}ms 후)`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        this.logger.error(`Google AI 호출 실패: ${msg}`);
        throw new TrendSummaryFailed(msg);
      }
    }
    throw new TrendSummaryFailed();
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
      '- 반드시 JSON {"headline","summary","bullets"} 형식으로만 답합니다.',
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
}
