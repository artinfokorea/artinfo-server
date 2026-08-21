import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { FetchedArticle } from '@/trend/service/trend-news.fetcher';
import { TrendAiNotConfigured, TrendSummaryFailed } from '@/trend/exception/trend.exception';

export interface AiPerson {
  /** 기사 표기 한글 이름 */
  name: string;
  /** 동명이인 구분용 한 줄 — 직업·소속·대표작 등 ("축구선수, 前 토트넘·現 LAFC") */
  disambiguation: string;
  /** 이번 이슈에서 이 인물의 역할 (기사 근거) */
  roleInIssue: string;
  englishName: string | null;
  /** "1992년 7월 8일 (33세) · 강원 춘천" */
  birth: string | null;
  /** "183cm · 78kg" */
  body: string | null;
  affiliation: string | null;
  education: string[];
  /** 주요 경력, 최신순 최대 5개 */
  career: string[];
  /** 프로필 정보의 확신도 — low면 프론트에서 상세 정보를 접어 보여준다 */
  confidence: 'high' | 'medium' | 'low';
}

export interface AiSummary {
  headline: string;
  summary: string;
  bullets: string[];
  people: AiPerson[];
}

const MAX_PEOPLE = 3;

type Provider = 'openai' | 'gemini';

// 기본 provider는 OpenAI(서버에 OPENAI_API_KEY가 이미 있음). TREND_AI_PROVIDER=gemini 로 전환 가능.
const DEFAULT_MODEL: Record<Provider, string> = {
  openai: 'gpt-5-mini',
  gemini: 'gemini-2.5-flash-lite',
};

const NULLABLE_STRING = { type: ['string', 'null'] } as const;
const STRING_ARRAY = { type: 'array', items: { type: 'string' } } as const;

const PERSON_JSON_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    disambiguation: { type: 'string' },
    roleInIssue: { type: 'string' },
    englishName: NULLABLE_STRING,
    birth: NULLABLE_STRING,
    body: NULLABLE_STRING,
    affiliation: NULLABLE_STRING,
    education: STRING_ARRAY,
    career: STRING_ARRAY,
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['name', 'disambiguation', 'roleInIssue', 'englishName', 'birth', 'body', 'affiliation', 'education', 'career', 'confidence'],
  additionalProperties: false,
} as const;

const RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    summary: { type: 'string' },
    bullets: STRING_ARRAY,
    people: { type: 'array', items: PERSON_JSON_SCHEMA },
  },
  required: ['headline', 'summary', 'bullets', 'people'],
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
        people: this.normalizePeople(parsed.people),
      };
    } catch {
      this.logger.error(`AI 응답 파싱 실패: ${text.slice(0, 200)}`);
      throw new TrendSummaryFailed();
    }
  }

  private normalizePeople(raw: unknown): AiPerson[] {
    if (!Array.isArray(raw)) return [];
    const str = (v: unknown): string | null => {
      const t = typeof v === 'string' ? v.trim() : '';
      return t && t !== 'null' && t !== '미상' && t !== '알 수 없음' ? t : null;
    };
    const list = (v: unknown, max: number): string[] =>
      Array.isArray(v) ? v.map(x => str(x)).filter((x): x is string => !!x).slice(0, max) : [];
    return raw
      .map(
        (p: any): AiPerson => ({
          name: str(p?.name) ?? '',
          disambiguation: str(p?.disambiguation) ?? '',
          roleInIssue: str(p?.roleInIssue) ?? '',
          englishName: str(p?.englishName),
          birth: str(p?.birth),
          body: str(p?.body),
          affiliation: str(p?.affiliation),
          education: list(p?.education, 4),
          career: list(p?.career, 5),
          confidence: p?.confidence === 'high' || p?.confidence === 'medium' ? p.confidence : 'low',
        }),
      )
      .filter(p => p.name && p.disambiguation)
      .slice(0, MAX_PEOPLE);
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
            people: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  disambiguation: { type: SchemaType.STRING },
                  roleInIssue: { type: SchemaType.STRING },
                  englishName: { type: SchemaType.STRING, nullable: true },
                  birth: { type: SchemaType.STRING, nullable: true },
                  body: { type: SchemaType.STRING, nullable: true },
                  affiliation: { type: SchemaType.STRING, nullable: true },
                  education: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  career: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  confidence: { type: SchemaType.STRING, format: 'enum', enum: ['high', 'medium', 'low'] },
                },
                required: ['name', 'disambiguation', 'roleInIssue', 'education', 'career', 'confidence'],
              },
            },
          },
          required: ['headline', 'summary', 'bullets', 'people'],
        },
        maxOutputTokens: 3072,
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
      '',
      '작성 규칙:',
      '- 기사에 없는 내용은 추측하거나 지어내지 않는다.',
      '- 여러 기사가 같은 사건을 다루면 하나로 묶고, 서로 다른 이슈가 섞여 있으면 가장 많이 다뤄진 이슈를 중심으로 쓰되 다른 이슈도 한 문장으로 언급한다.',
      '- 기사체(~했다, ~이다)로 쓴다. 존댓말 금지.',
      '- 맞춤법과 띄어쓰기를 정확히 지키고, 고유명사는 기사 표기를 그대로 따른다.',
      '- 아래 필드 설명에 쓰인 안내 문구("무슨 일", "왜 관심" 등)는 절대 출력에 포함하지 않는다. 바로 내용으로 시작한다.',
      '',
      '출력 필드:',
      '- headline: 이슈의 핵심을 담은 한 줄 제목. 10~20자, 명사형으로 끝맺음. 예) "LAFC 벤치 논란 속 5경기 무득점"',
      '- summary: 2~3문장의 자연스러운 단락. 사건 경위를 먼저 쓰고, 이어서 사람들의 관심이 쏠린 배경을 쓴다. 문장 앞에 소제목이나 라벨을 붙이지 않는다.',
      '- bullets: 핵심 사실 3~5개. 각 40자 이내의 완결된 구. 날짜·숫자·인물 등 구체 정보 위주.',
      `- people: 이슈의 중심 인물 프로필 0~${MAX_PEOPLE}명. 아래 "인물 규칙"을 따른다.`,
      '',
      '인물 규칙:',
      '- 대상은 공인만: 정치인, 연예인, 운동선수, 기업인, 작가, 방송인, 유튜버 등 공적 활동으로 이미 널리 알려진 인물.',
      '- 제외 대상: 사건·사고의 피의자, 피해자, 제보자, 일반인, 미성년자, 기사에서 익명·이니셜로 처리된 사람. 기사가 실명을 썼더라도 공인이 아니면 넣지 않는다. 해당 인물이 없으면 빈 배열 [].',
      '- 동명이인 특정: 같은 이름의 유명인이 여럿일 수 있다. 반드시 기사 문맥(직업, 소속, 나이, 작품, 사건)으로 어느 인물인지 확정하고, disambiguation에 그 근거가 되는 구분 정보를 쓴다. 예) "축구선수, 前 토트넘·現 LAFC", "배우, 드라마 <무빙> 출연". 기사 문맥으로 특정되지 않으면 프로필 항목(englishName~career)은 모두 null/[]로 두고 confidence는 low.',
      '- name, disambiguation, roleInIssue 세 항목은 반드시 기사에 근거해 쓴다.',
      '- roleInIssue: 이번 이슈에서 이 인물이 무엇을 했거나 어떤 일을 겪었는지 기사에 나온 사실만으로 1문장(40자 이내)으로 쓴다. 기사에 없는 배경 지식이나 평가를 덧붙이지 않는다. 예) "LAFC 이적 후 첫 경기에서 결승골을 넣었다".',
      '- 나머지 프로필(englishName, birth, body, affiliation, education, career)은 기사에 의존하지 말고, 위에서 특정한 그 인물에 대해 당신이 알고 있는 지식을 바탕으로 최대한 상세하게 채운다. 백과사전·공식 프로필에 실리는 수준의 정보는 모두 대상이다. 항목을 비우는 것은 그 인물을 정말 모를 때뿐이며, 일부만 알면 아는 부분만이라도 쓴다(예: 출생 연도만 알면 "1985년").',
      '- 단, 동명이인의 정보를 섞지 않도록 disambiguation으로 특정한 인물의 정보만 쓴다.',
      '- birth는 "YYYY년 M월 D일 (만 나이) · 출생지" 형식, 모르는 부분은 생략. body는 "183cm · 78kg" 형식(운동선수·연예인 등 프로필에 신체 정보가 통상 공개되는 직군). education은 최종 학력부터 학교·전공까지, career는 최신순 최대 5개(소속 이력, 대표작, 수상, 직책 등).',
      '- confidence: 인물이 확실히 특정되고 프로필을 잘 아는 인물이면 high, 인물은 특정되나 프로필 일부가 기억에 의존해 불확실하면 medium, 인물 특정이 어렵거나 거의 모르는 인물이면 low. 불확실하다고 항목을 비우지 말고 confidence로 표현한다.',
      '',
      '반드시 JSON {"headline","summary","bullets","people"} 형식으로만 답한다.',
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
