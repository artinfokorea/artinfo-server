import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
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
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env['AZEYO_GPT_API_KEY'],
      maxRetries: 3,
    });
  }

  async generatePost(commentCount: number): Promise<GptGeneratedPost> {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const isVote = Math.random() < 0.25;
    const type = isVote ? AZEYO_COMMUNITY_POST_TYPE.VOTE : AZEYO_COMMUNITY_POST_TYPE.TEXT;

    const prompt = this.buildPrompt(type, category, commentCount);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: '게시글과 댓글을 생성해주세요.' },
        ],
        max_completion_tokens: 2000,
        temperature: 0.9,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('GPT 응답이 비어있습니다');

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
      this.logger.error('GPT 게시글 생성 실패', e);
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
    };

    const isVote = type === AZEYO_COMMUNITY_POST_TYPE.VOTE;

    return `당신은 "아재요"라는 기혼 남성 커뮤니티의 회원입니다.
카테고리: ${category} (${categoryDescriptions[category]})
게시글 타입: ${isVote ? 'VOTE (A/B 투표)' : 'TEXT (일반 글)'}

## 규칙
- 기혼 남성(30~50대)의 자연스러운 말투로 작성
- 반말이나 친근한 말투 사용 (너무 격식체 X)
- 실생활에서 공감할 수 있는 내용
- 제목은 20자 이내로 간결하게
- 본문은 2~5문장
- 이모지 사용 가능하지만 과하지 않게
${isVote ? '- voteOptionA, voteOptionB: 각 10자 이내의 투표 선택지' : ''}
${commentCount > 0 ? `- comments: ${commentCount}개의 댓글 (각각 다른 사람이 쓴 것처럼, 1~2문장)` : '- comments: 빈 배열'}

## JSON 형식으로만 응답
{
  "title": "제목",
  "contents": "본문 내용",
  ${isVote ? '"voteOptionA": "선택지A",\n  "voteOptionB": "선택지B",' : ''}
  "comments": [${commentCount > 0 ? '"댓글1", "댓글2"' : ''}]
}`;
  }
}
