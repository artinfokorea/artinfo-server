import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AZEYO_COMMUNITY_CATEGORY,
  AZEYO_COMMUNITY_POST_TYPE,
} from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

export interface GptGeneratedPost {
  type: AZEYO_COMMUNITY_POST_TYPE;
  category: AZEYO_COMMUNITY_CATEGORY;
  title: string;
  contents: string;
  voteOptionA: string | null;
  voteOptionB: string | null;
  comments: string[];
}

const CATEGORIES = Object.values(AZEYO_COMMUNITY_CATEGORY);

@Injectable()
export class AzeyoCommunityGptService {
  private readonly logger = new Logger(AzeyoCommunityGptService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(
      process.env['AZEYO_GOOGLE_AI_API_KEY'] || '',
    );
  }

  async generatePost(commentCount: number, excludeCategory?: AZEYO_COMMUNITY_CATEGORY | null): Promise<GptGeneratedPost> {
    const candidates = excludeCategory
      ? CATEGORIES.filter(c => c !== excludeCategory)
      : CATEGORIES;
    const category = candidates[Math.floor(Math.random() * candidates.length)];
    const isVote = Math.random() < 0.25;
    const type = isVote ? AZEYO_COMMUNITY_POST_TYPE.VOTE : AZEYO_COMMUNITY_POST_TYPE.TEXT;

    const systemPrompt = this.buildPrompt(type, category, commentCount);

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 2000,
          temperature: 0.9,
        },
      });

      const response = await model.generateContent({
        systemInstruction: systemPrompt,
        contents: [{ role: 'user', parts: [{ text: '게시글과 댓글을 생성해주세요.' }] }],
      });

      const content = response.response.text();
      if (!content) throw new Error('Google AI 응답이 비어있습니다');

      const parsed = JSON.parse(content);

      return {
        type,
        category,
        title: parsed.title,
        contents: parsed.contents,
        voteOptionA: type === AZEYO_COMMUNITY_POST_TYPE.VOTE ? parsed.voteOptionA : null,
        voteOptionB: type === AZEYO_COMMUNITY_POST_TYPE.VOTE ? parsed.voteOptionB : null,
        comments: (parsed.comments || []).slice(0, commentCount),
      };
    } catch (e) {
      this.logger.error('Google AI 게시글 생성 실패', e);
      throw e;
    }
  }

  private buildPrompt(type: AZEYO_COMMUNITY_POST_TYPE, category: AZEYO_COMMUNITY_CATEGORY, commentCount: number): string {
    const categoryDescriptions: Record<AZEYO_COMMUNITY_CATEGORY, string> = {
      [AZEYO_COMMUNITY_CATEGORY.GIFT]: '선물 추천/고민 (아내, 장인장모, 아이 선물 등)',
      [AZEYO_COMMUNITY_CATEGORY.COUPLE_FIGHT]: '부부 갈등/고민 상담',
      [AZEYO_COMMUNITY_CATEGORY.HOBBY]: '취미 생활 공유 (운동, 게임, 캠핑 등)',
      [AZEYO_COMMUNITY_CATEGORY.PARENTING]: '육아 팁/고민 공유',
      [AZEYO_COMMUNITY_CATEGORY.LIFE_TIP]: '생활 꿀팁 공유',
      [AZEYO_COMMUNITY_CATEGORY.FREE]: '자유 주제 잡담',
      [AZEYO_COMMUNITY_CATEGORY.WORK]: '직장생활/회사 고민 (상사, 이직, 연봉 등)',
      [AZEYO_COMMUNITY_CATEGORY.HEALTH]: '건강/운동 (체력저하, 다이어트, 건강검진)',
      [AZEYO_COMMUNITY_CATEGORY.IN_LAWS]: '시댁/처가 관계 (명절, 경조사 등)',
    };

    const isVote = type === AZEYO_COMMUNITY_POST_TYPE.VOTE;

    return `너는 "아재요"라는 기혼 남성 커뮤니티에 글 쓰는 30~50대 남자야.
카테고리: ${category} (${categoryDescriptions[category]})
게시글 타입: ${isVote ? 'VOTE (A/B 투표)' : 'TEXT (일반 글)'}

## 말투 규칙
- 카톡이나 남초 커뮤니티에서 쓰는 편한 반말 (예: "~했음", "~인데", "~ㅋㅋ", "~함", "진짜 ㅋㅋ")
- "ㅋㅋ", "ㅎㅎ", "ㄹㅇ", "ㅇㅈ" 같은 자음 표현 자연스럽게 섞기
- 마침표(.) 대신 줄바꿈이나 "ㅋㅋ"로 문장 끝내기
- 절대 존댓말, 격식체, "~습니다", "~합니다" 사용 금지
- 이모지/이모티콘 사용 금지

## 내용 규칙
- 진짜 있을법한 구체적인 상황 (날짜, 장소, 금액 등 디테일 넣기)
- 자조적 유머, 한탄, 과장 자유롭게 (예: "월급은 통장 스쳐가고", "눈치가 생존스킬")
- 제목은 15자 이내, 궁금해서 클릭하게
- 본문은 2~5문장, 짧고 임팩트 있게
${isVote ? '- voteOptionA, voteOptionB: 각 10자 이내의 투표 선택지' : ''}
${commentCount > 0 ? `- comments: ${commentCount}개의 댓글 (각각 다른 아재가 쓴 것처럼, 공감/훈수/드립 섞어서 1~2문장)` : '- comments: 빈 배열'}

## JSON 형식으로만 응답
{
  "title": "제목",
  "contents": "본문 내용",
  ${isVote ? '"voteOptionA": "선택지A",\n  "voteOptionB": "선택지B",' : ''}
  "comments": [${commentCount > 0 ? '"댓글1", "댓글2"' : ''}]
}`;
  }
}
