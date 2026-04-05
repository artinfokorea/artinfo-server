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

  async generatePost(commentCount: number, recentPosts: { category: string; title: string }[] = []): Promise<GptGeneratedPost> {
    // 최근 글 카테고리들을 제외하고 선택 (모두 겹치면 전체에서 랜덤)
    const recentCategories = new Set(recentPosts.map(p => p.category));
    const candidates = CATEGORIES.filter(c => !recentCategories.has(c));
    const category = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const isVote = Math.random() < 0.25;
    const type = isVote ? AZEYO_COMMUNITY_POST_TYPE.VOTE : AZEYO_COMMUNITY_POST_TYPE.TEXT;

    const systemPrompt = this.buildPrompt(type, category, commentCount, recentPosts);

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

  private buildPrompt(type: AZEYO_COMMUNITY_POST_TYPE, category: AZEYO_COMMUNITY_CATEGORY, commentCount: number, recentPosts: { category: string; title: string }[] = []): string {
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

    const now = new Date();
    const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const dayOfWeek = now.toLocaleDateString('ko-KR', { weekday: 'long', timeZone: 'Asia/Seoul' });
    const kstHour = kstNow.getHours();
    const kstMinute = kstNow.getMinutes();
    const kstDay = kstNow.getDay();
    const isWeekend = [0, 6].includes(kstDay);

    const recentPostsSection = recentPosts.length > 0
      ? `\n## 최근 글 (중복 금지)\n아래는 최근 올라온 글 목록이야. 이 글들과 비슷한 주제나 내용은 절대 쓰지 마.\n${recentPosts.map((p, i) => `${i + 1}. [${p.category}] ${p.title}`).join('\n')}\n`
      : '';

    return `너는 "아재요"라는 기혼 남성 커뮤니티에 글 쓰는 30~50대 남자야.
카테고리: ${category} (${categoryDescriptions[category]})
게시글 타입: ${isVote ? 'VOTE (A/B 투표)' : 'TEXT (일반 글)'}
오늘: ${dayOfWeek} (${isWeekend ? '주말' : '평일'})
현재 한국시간: ${kstHour}시 ${kstMinute}분
${recentPostsSection}
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
- 주말(토/일) 규칙: 본인, 아내, 가족 모두 출근/퇴근/회사/직장 관련 내용 절대 쓰지 마. 자녀의 학교/어린이집/유치원 등원/등교/하원/하교도 쓰지 마. 주말에는 온 가족이 쉬는 상황(집, 외출, 취미, 가족 나들이 등)으로만 쓰기
- 평일(월~금) 규칙: 출근/퇴근/회사, 자녀 등원/등교 등 평일에 맞는 일상 상황 자유롭게 쓰기
- 시간/날짜 관련 규칙: 지금은 ${dayOfWeek} ${kstHour}시${kstMinute}분이야. 글 속에서 날짜나 요일을 언급할 때 현재 시점과 맞아야 해. 예를 들어 오늘이 일요일 밤이면 "이번주 일요일"이 아니라 "오늘"이라고 써야 하고, 이미 지난 시간대의 일을 앞으로 할 일처럼 쓰면 안 됨. ${kstHour < 12 ? '지금은 오전이니까 아침/출근길 상황' : kstHour < 18 ? '지금은 오후니까 점심 후/업무 중 상황' : '지금은 저녁/밤이니까 퇴근 후/저녁식사/집에서 쉬는 상황'}에 맞게 쓰기
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
