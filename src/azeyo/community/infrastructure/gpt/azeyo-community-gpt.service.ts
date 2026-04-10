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

  async generatePost(commentCount: number, recentPosts: { category: string; title: string }[] = [], postTime?: Date): Promise<GptGeneratedPost> {
    // 최근 글 카테고리들을 제외하고 선택 (모두 겹치면 전체에서 랜덤)
    const recentCategories = new Set(recentPosts.map(p => p.category));
    const candidates = CATEGORIES.filter(c => !recentCategories.has(c));
    const category = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const isVote = Math.random() < 0.1; // 일반글:투표 = 9:1
    const type = isVote ? AZEYO_COMMUNITY_POST_TYPE.VOTE : AZEYO_COMMUNITY_POST_TYPE.TEXT;

    const systemPrompt = this.buildPrompt(type, category, commentCount, recentPosts, postTime);

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 8000,
        temperature: 0.9,
      },
    });

    // 1차: 글 생성 (재시도 포함)
    const content = await this.callWithRetry(() =>
      model.generateContent({
        systemInstruction: systemPrompt,
        contents: [{ role: 'user', parts: [{ text: '게시글과 댓글을 생성해주세요.' }] }],
      }),
    );
    const parsed = JSON.parse(content);

    // 2차: 검증 및 수정 (실패해도 1차 결과 사용)
    let reviewed = parsed;
    try {
      const reviewPrompt = this.buildReviewPrompt(type, category, commentCount);
      const reviewContent = await this.callWithRetry(() =>
        model.generateContent({
          systemInstruction: reviewPrompt,
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(parsed) }] }],
        }),
      );
      reviewed = JSON.parse(reviewContent);
    } catch (e) {
      this.logger.warn('2차 검증 실패, 1차 결과 사용', e);
    }

    return {
      type,
      category,
      title: reviewed.title,
      contents: reviewed.contents,
      voteOptionA: type === AZEYO_COMMUNITY_POST_TYPE.VOTE ? reviewed.voteOptionA : null,
      voteOptionB: type === AZEYO_COMMUNITY_POST_TYPE.VOTE ? reviewed.voteOptionB : null,
      comments: (reviewed.comments || []).slice(0, commentCount),
    };
  }

  private async callWithRetry(
    fn: () => Promise<{ response: { text: () => string } }>,
    maxRetries = 3,
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fn();
        const text = response.response.text();
        if (!text) throw new Error('Google AI 응답이 비어있습니다');
        return text;
      } catch (e: any) {
        const isRetryable = e?.message?.includes('503') || e?.message?.includes('429') || e?.message?.includes('high demand');
        if (isRetryable && attempt < maxRetries) {
          const delay = attempt * 3000; // 3초, 6초, 9초
          this.logger.warn(`Google AI 재시도 ${attempt}/${maxRetries} (${delay}ms 후)`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw e;
      }
    }
    throw new Error('Google AI 최대 재시도 횟수 초과');
  }

  private buildPrompt(type: AZEYO_COMMUNITY_POST_TYPE, category: AZEYO_COMMUNITY_CATEGORY, commentCount: number, recentPosts: { category: string; title: string }[] = [], postTime?: Date): string {
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

    // 글이 등록될 시간 기준으로 KST 계산
    const baseTime = postTime || new Date();
    const kstMs = baseTime.getTime() + 9 * 60 * 60 * 1000;
    const kstNow = new Date(kstMs);
    const kstHour = kstNow.getUTCHours();
    const kstDay = kstNow.getUTCDay();
    const kstDate = kstNow.getUTCDate();
    const isWeekend = [0, 6].includes(kstDay);
    const kstMonth = kstNow.getUTCMonth() + 1;
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayOfWeek = dayNames[kstDay];

    // 명절 시즌: 2월(설날), 9월(추석)
    const isHolidaySeason = kstMonth === 2 || kstMonth === 9;
    const holidayName = kstMonth === 2 ? '설날' : kstMonth === 9 ? '추석' : '';

    this.logger.log(`글 생성 시간 기준 KST: ${dayOfWeek} ${kstHour}시 (postTime: ${baseTime.toISOString()})`);

    const recentPostsSection = recentPosts.length > 0
      ? `\n## 제목/주제 중복 금지 (매우 중요!!!)\n아래는 최근 올라온 글 제목 목록이야. 반드시 지켜야 할 규칙:\n1. 아래 제목과 같거나 비슷한 제목 절대 금지 (단어만 바꾸거나 순서만 바꾸는 것도 금지)\n2. 아래 글들과 같은 주제/소재/상황도 금지\n3. 완전히 새로운 주제와 제목으로 작성해야 함\n\n금지된 제목 목록:\n${recentPosts.map((p, i) => `${i + 1}. [${p.category}] "${p.title}"`).join('\n')}\n\n위 제목들과 조금이라도 비슷하면 안 됨. 완전히 다른 새로운 이야기를 써.\n`
      : '';

    return `너는 "아재요"라는 기혼 남성 커뮤니티에 글 쓰는 30~50대 남자야.
카테고리: ${category} (${categoryDescriptions[category]})
게시글 타입: ${isVote ? 'VOTE (A/B 투표)' : 'TEXT (일반 글)'}
오늘: ${kstMonth}월 ${kstDate}일 ${dayOfWeek} (${isWeekend ? '주말' : '평일'})
지금 시간대: ${kstHour < 1 ? '밤늦은 시간' : kstHour < 6 ? '새벽' : kstHour < 9 ? '이른 아침' : kstHour < 12 ? '오전' : kstHour < 14 ? '점심시간' : kstHour < 18 ? '오후' : kstHour < 22 ? '저녁' : '밤늦은 시간'}

## 가장 중요한 규칙
반드시 "${categoryDescriptions[category]}" 주제로만 글을 써야 해. 다른 카테고리 주제로 쓰면 안 됨.
예를 들어 카테고리가 "육아"면 육아 관련 내용만, "선물"이면 선물 관련 내용만 써야 함.
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
- 본문은 2~4문장, 짧고 임팩트 있게 (절대 5문장 넘기지 마)
- 주말(토/일) 규칙: 출근/퇴근/회사/직장/학교/어린이집/유치원 관련 내용 절대 금지. 주말에는 온 가족이 쉬는 상황으로만 쓰기
- 평일(월~금) 근무시간(09~18시)에만 회사/직장/출퇴근 관련 내용 가능. 새벽/밤(22시~08시)에는 회사/직장/팀장/상사/야근/퇴근 관련 내용 쓰지 마. 새벽/밤에는 집에서 쉬는 상황으로 쓰기
- 글 속에 시각/시간 표현을 절대 쓰지 마. "N시", "N분", "N시 반" 모두 금지 (예: "새벽 2시", "0시 7분", "3시 반", "오후 3시" 전부 금지). 시간을 언급하려면 "아까", "오늘", "방금", "잠깐 전" 같이 쓰기
- 날짜/요일 관련: 오늘은 ${kstMonth}월 ${kstDate}일이야. 날짜를 언급할 때 실제 오늘 날짜와 맞아야 함. 예를 들어 "15일이라 월급 들어왔는데"는 오늘이 15일이 아니면 쓰면 안 됨. 오늘이 일요일 밤이면 "이번주 일요일"이 아니라 "오늘"이라고 쓰기. 이미 지난 시간대의 일을 앞으로 할 일처럼 쓰면 안 됨
${isHolidaySeason ? `- 지금은 ${holidayName} 시즌이야. 명절 관련 내용(${holidayName} 준비, 시댁/처가 방문, 세뱃돈/용돈, 명절 스트레스, 귀성길 등)을 자연스럽게 녹여서 써도 좋아. 단, 카테고리에 맞는 내용이어야 함` : '- [필수] 명절(설날/추석/차례/세뱃돈/귀성길/시댁 명절/처가 명절) 관련 내용은 절대 쓰지 마. 지금은 명절 시즌이 아님. 이 규칙을 어기면 안 됨'}
- [필수] 지금은 "${kstHour < 1 ? '밤늦은 시간' : kstHour < 6 ? '새벽' : kstHour < 9 ? '이른 아침' : kstHour < 12 ? '오전' : kstHour < 14 ? '점심시간' : kstHour < 18 ? '오후' : kstHour < 22 ? '저녁' : '밤늦은 시간'}" 시간대야. 이 시간대에 맞는 상황으로만 써야 하고, 다른 시간대 상황은 절대 금지:
  - 지금 써야 할 상황: ${kstHour < 1 ? '아이 재우고 혼자 있는 시간/야식/취침 전 상황 (출근/점심/저녁식사 내용 금지)' : kstHour < 6 ? '잠이 안 오거나 야식/혼자 있는 상황' : kstHour < 9 ? '기상/출근 준비/등원 상황' : kstHour < 12 ? '출근 후 업무 중 상황 (점심/점심시간/점심메뉴/밥 먹는 내용 금지 - 아직 점심 전임)' : kstHour < 14 ? '점심 식사/휴식 상황' : kstHour < 18 ? '업무 중/오후 상황 (점심/점심메뉴 내용 금지 - 점심은 이미 지남)' : kstHour < 22 ? '퇴근 후/저녁식사/가족 시간 상황 (출근/점심 내용 금지)' : '아이 재우고 혼자 있는 시간/야식/취침 전 상황 (출근/점심/저녁식사 내용 금지)'}
  - 금지 예시: ${kstHour < 1 ? '출근/점심/업무 중 관련 내용' : kstHour < 12 ? '점심/저녁/퇴근 관련 내용' : kstHour < 14 ? '출근 준비/아침 관련 내용' : kstHour < 18 ? '점심 먹는 중/아침/출근 준비 관련 내용' : kstHour < 22 ? '출근/점심/오전 업무 관련 내용' : '출근/점심/업무 중 관련 내용'}
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

  private buildReviewPrompt(type: AZEYO_COMMUNITY_POST_TYPE, category: AZEYO_COMMUNITY_CATEGORY, commentCount: number): string {
    const now = new Date();
    const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
    const kstNow = new Date(kstMs);
    const kstHour = kstNow.getUTCHours();
    const kstDay = kstNow.getUTCDay();
    const kstMonth = kstNow.getUTCMonth() + 1;
    const isWeekend = [0, 6].includes(kstDay);
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayOfWeek = dayNames[kstDay];
    const timeSlot = kstHour < 6 ? '새벽' : kstHour < 9 ? '이른 아침' : kstHour < 12 ? '오전' : kstHour < 14 ? '점심시간' : kstHour < 18 ? '오후' : kstHour < 22 ? '저녁' : '밤늦은 시간';
    const isVote = type === AZEYO_COMMUNITY_POST_TYPE.VOTE;
    const isHolidaySeason = kstMonth === 2 || kstMonth === 9;

    return `너는 기혼 남성 커뮤니티 게시글 검수자야. 아래 JSON을 검토하고 문제가 있으면 수정해서 같은 JSON 형식으로 응답해. 문제없으면 그대로 응답해.

현재: ${kstMonth}월 ${kstNow.getUTCDate()}일 ${dayOfWeek} ${timeSlot} (${isWeekend ? '주말' : '평일'})

## 검수 기준
1. 시각 표현 금지: "N시", "N분", "N시 반" 등 구체적 시각이 있으면 "아까", "방금", "오늘" 등으로 수정
1-1. 날짜 불일치: 글에서 특정 날짜를 언급하는데(예: "15일이라 월급") 오늘 날짜와 맞지 않으면 오늘 날짜에 맞게 수정하거나 날짜 표현을 제거
2. 시간대 부적합: ${isWeekend ? '주말인데 출근/퇴근/회사/직장/학교 내용이 있으면 집/가족/외출 상황으로 수정' : kstHour < 8 || kstHour >= 22 ? '새벽/밤인데 출근/퇴근/회사/팀장/야근 내용이 있으면 집에서 쉬는 상황으로 수정' : '현재 시간대에 맞지 않는 상황이 있으면 수정'}
3. 카테고리 불일치: 카테고리 "${category}"와 내용이 안 맞으면 카테고리에 맞게 수정
4. 말투: 존댓말이나 격식체가 있으면 반말로 수정
5. 명절 금지: ${isHolidaySeason ? '현재 명절 시즌이므로 명절 내용 허용' : '지금은 명절 시즌이 아님. 설날/추석/명절/차례/세뱃돈/귀성길/시댁 명절/처가 명절 관련 내용이 있으면 명절과 무관한 일상 내용으로 반드시 수정'}

## JSON 형식으로만 응답
{
  "title": "제목",
  "contents": "본문 내용",
  ${isVote ? '"voteOptionA": "선택지A",\n  "voteOptionB": "선택지B",' : ''}
  "comments": [${commentCount > 0 ? '"댓글1", "댓글2"' : ''}]
}`;
  }
}
