import { ApiProperty } from '@nestjs/swagger';

/** 관리자 화면에서도 이메일 원문은 보이지 않게: ab***@gmail.com */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return `${local.slice(0, 2)}***`;
  return `${local.slice(0, 2)}***@${domain}`;
}

class CountWithRecent {
  @ApiProperty({ type: Number, description: '전체' }) total: number;
  @ApiProperty({ type: Number, description: '최근 7일' }) last7d: number;
  @ApiProperty({ type: Number, description: '최근 30일' }) last30d: number;
}

export class AdminOverviewResponse {
  @ApiProperty({ type: CountWithRecent, description: '회원 (탈퇴 제외)' }) users: CountWithRecent;
  @ApiProperty({ type: CountWithRecent, description: '로그인한 사용자 (total 은 최근 30일)' }) activeUsers: CountWithRecent;
  @ApiProperty({ type: CountWithRecent, description: '채용 공고' }) jobs: CountWithRecent;
  @ApiProperty({ type: Number, description: '진행 중 채용' }) activeJobs: number;
  @ApiProperty({ type: CountWithRecent, description: '나눔 글' }) posts: CountWithRecent;
  @ApiProperty({ type: CountWithRecent, description: '댓글 (last30d 미집계 시 0)' }) comments: CountWithRecent;
  @ApiProperty({ type: Number }) lessons: number;
  @ApiProperty({ type: Number }) performances: number;
  @ApiProperty({ type: Number, description: '종료되지 않은 공연' }) upcomingPerformances: number;
  @ApiProperty({ type: Number }) news: number;
  @ApiProperty({ type: CountWithRecent, description: '문의 (last7d 미집계 시 0)' }) inquiries: CountWithRecent;
}

export class AdminDailyPointResponse {
  @ApiProperty({ type: String, description: '한국 날짜 YYYY-MM-DD' }) date: string;
  @ApiProperty({ type: Number, description: '가입' }) signups: number;
  @ApiProperty({ type: Number, description: '로그인한 사용자' }) activeUsers: number;
  @ApiProperty({ type: Number, description: '새 채용 공고' }) jobs: number;
  @ApiProperty({ type: Number, description: '새 나눔 글' }) posts: number;
  @ApiProperty({ type: Number, description: '새 댓글' }) comments: number;
}

export class AdminDailyResponse {
  @ApiProperty({ type: Number }) days: number;
  @ApiProperty({ type: [AdminDailyPointResponse] }) points: AdminDailyPointResponse[];
}

class TypeCount {
  @ApiProperty({ type: String }) type: string;
  @ApiProperty({ type: Number }) count: number;
}

class RecentUser {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) nickname: string;
  @ApiProperty({ type: String, description: '마스킹된 이메일' }) email: string;
  @ApiProperty({ type: Date }) createdAt: Date;
}

class TopPost {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: Number }) viewCount: number;
  @ApiProperty({ type: Date }) createdAt: Date;
}

class RecentInquiry {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String, description: '마스킹된 이메일' }) email: string;
  @ApiProperty({ type: Date }) createdAt: Date;
}

export class AdminBreakdownResponse {
  @ApiProperty({ type: [TypeCount], description: '최근 30일 로그인 방식별 사용자 수' }) loginsByType: TypeCount[];
  @ApiProperty({ type: [TypeCount], description: '진행 중 채용 유형별 수' }) jobsByType: TypeCount[];
  @ApiProperty({ type: [RecentUser] }) recentUsers: RecentUser[];
  @ApiProperty({ type: [TopPost], description: '최근 30일 조회수 상위 나눔 글' }) topPosts: TopPost[];
  @ApiProperty({ type: [RecentInquiry] }) recentInquiries: RecentInquiry[];
}

class EngagementSummary {
  @ApiProperty({ type: Number, description: '오늘 방문자 (비회원 포함)' }) dau: number;
  @ApiProperty({ type: Number, description: '최근 7일 방문자' }) wau: number;
  @ApiProperty({ type: Number, description: '최근 30일 방문자' }) mau: number;
  @ApiProperty({ type: Number, description: '오늘 방문한 회원' }) memberDau: number;
  @ApiProperty({ type: Number }) memberWau: number;
  @ApiProperty({ type: Number }) memberMau: number;
  @ApiProperty({ type: Number, description: '최근 7일, 방문자 1명이 하루에 머문 평균 초' }) avgSeconds7d: number;
}

class EngagementPointResponse {
  @ApiProperty({ type: String }) date: string;
  @ApiProperty({ type: Number }) visitors: number;
  @ApiProperty({ type: Number }) members: number;
  @ApiProperty({ type: Number, description: '방문자 1명당 평균 체류 초' }) avgSeconds: number;
}

class RetentionCohortResponse {
  @ApiProperty({ type: String, description: '첫 방문 주의 월요일' }) cohort: string;
  @ApiProperty({ type: Number, description: '그 주에 처음 온 방문자 수' }) size: number;
  @ApiProperty({ type: [Number], description: '1~4주차 재방문 비율(%), 측정 전이면 null', nullable: true }) weeks: (number | null)[];
}

export class AdminEngagementResponse {
  @ApiProperty({ type: EngagementSummary }) summary: EngagementSummary;
  @ApiProperty({ type: Number }) days: number;
  @ApiProperty({ type: [EngagementPointResponse] }) daily: EngagementPointResponse[];
  @ApiProperty({ type: [RetentionCohortResponse], description: '최근 8주 첫 방문 주별 리텐션' }) retention: RetentionCohortResponse[];
}

class VisitorRowResponse {
  @ApiProperty({ type: String, description: '방문자 ID 앞 8자리' }) visitorId: string;
  @ApiProperty({ type: String, nullable: true, description: '회원이면 닉네임' }) nickname: string | null;
  @ApiProperty({ type: Date }) firstSeenAt: Date;
  @ApiProperty({ type: Date }) lastSeenAt: Date;
  @ApiProperty({ type: Number }) activeSeconds: number;
  @ApiProperty({ type: Number }) pageViews: number;
  @ApiProperty({ type: Number }) sessions: number;
  @ApiProperty({ type: String, description: '모바일 | 태블릿 | 데스크톱 | 기타' }) device: string;
  @ApiProperty({ type: String }) os: string;
  @ApiProperty({ type: String }) browser: string;
  @ApiProperty({ type: String, nullable: true }) userAgent: string | null;
  @ApiProperty({ type: String, nullable: true, description: '외부 유입 도메인' }) referrerHost: string | null;
  @ApiProperty({ type: String, nullable: true, description: '처음 본 페이지' }) landingPath: string | null;
  @ApiProperty({ type: String, nullable: true, description: '마지막으로 본 페이지 (이탈 페이지)' }) exitPath: string | null;
  @ApiProperty({ type: [String], description: '그날 거친 페이지 경로 (순서대로, 최대 200개)' }) paths: string[];
  @ApiProperty({ type: Boolean, description: '참여 기준(10초 이상 또는 2페이지 이상) 충족' }) engaged: boolean;
}

export class AdminVisitorsResponse {
  @ApiProperty({ type: String, description: '한국 날짜' }) day: string;
  @ApiProperty({ type: Number }) total: number;
  @ApiProperty({ type: [VisitorRowResponse] }) visitors: VisitorRowResponse[];
}
