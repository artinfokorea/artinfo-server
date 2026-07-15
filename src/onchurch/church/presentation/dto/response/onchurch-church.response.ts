import { ApiProperty } from '@nestjs/swagger';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

export class OnchurchChurchResponse {
  @ApiProperty({ type: Number, required: true })
  id: number;

  @ApiProperty({ type: String, required: true })
  slug: string;

  @ApiProperty({ type: String, required: true })
  name: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  eng: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  tagline: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  email: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  address: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  representative: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  businessNo: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  logoUrl: string | null;

  @ApiProperty({ type: String, required: false, nullable: true, description: '유튜브 채널 URL' })
  youtubeUrl: string | null;

  @ApiProperty({ type: String, required: false, nullable: true, description: '인스타그램 URL' })
  instagramUrl: string | null;

  @ApiProperty({ type: String, required: false, nullable: true, description: '네이버 사이트 인증 코드' })
  naverVerification: string | null;

  @ApiProperty({ type: String, required: false, nullable: true, description: '라이브 영상 URL' })
  liveUrl: string | null;

  @ApiProperty({ type: Boolean, required: true, description: '실시간 방송 켜짐 여부' })
  isLive: boolean;

  @ApiProperty({ type: String, required: false, nullable: true, description: '라이브 시작 시각' })
  liveStartedAt: string | null;

  @ApiProperty({ type: [String], required: true })
  enabledPages: string[];

  @ApiProperty({ type: [String], required: true, description: '홈페이지 섹션 노출 순서' })
  homeSectionOrder: string[];

  @ApiProperty({ type: [String], required: true, description: "홈 '바로가기' 노출 항목" })
  homeQuickLinks: string[];

  @ApiProperty({ type: String, required: true, description: "공개 사이트 고정 UI 문구 언어 ('ko' | 'en')" })
  siteLang: string;

  @ApiProperty({ type: String, required: true, description: "공개 홈페이지 템플릿 ID (미지정 시 'default'). 지원 템플릿 목록은 프론트 레지스트리가 관리하며, 미지원 값은 프론트에서 default로 폴백" })
  siteTemplate: string;

  @ApiProperty({ type: Boolean, required: true, description: '사이트 운영 중 여부' })
  isPublished: boolean;

  @ApiProperty({ type: String, required: false, nullable: true, description: '최초 사이트 오픈(첫 공개) 시각 — 한 번이라도 오픈하면 채워지고 이후 OFF해도 유지' })
  firstPublishedAt: string | null;

  constructor(church: OnchurchChurch) {
    this.id = church.id;
    this.slug = church.slug;
    this.name = church.name;
    this.eng = church.eng;
    this.tagline = church.tagline;
    this.phone = church.phone;
    this.email = church.email;
    this.address = church.address;
    this.representative = church.representative;
    this.businessNo = church.businessNo;
    this.logoUrl = church.logoUrl;
    this.youtubeUrl = church.youtubeUrl;
    this.instagramUrl = church.instagramUrl;
    this.naverVerification = church.naverVerification;
    this.liveUrl = church.liveUrl;
    this.isLive = church.isLive ?? false;
    this.liveStartedAt = church.liveStartedAt ? church.liveStartedAt.toISOString() : null;
    this.enabledPages = church.enabledPages ?? [];
    this.homeSectionOrder = church.homeSectionOrder ?? [];
    this.homeQuickLinks = church.homeQuickLinks ?? [];
    this.siteLang = church.siteLang === 'en' ? 'en' : 'ko';
    // 서버는 템플릿 ID를 화이트리스트하지 않고 그대로 전달한다(새 템플릿 추가 시 서버 배포 불필요).
    // 미지원 값 처리는 프론트 템플릿 레지스트리의 default 폴백이 담당한다.
    this.siteTemplate = church.siteTemplate?.trim() || 'default';
    this.isPublished = church.isPublished ?? false;
    // 한 번이라도 사이트를 오픈(첫 publish)하면 채워지고, 이후 OFF해도 유지된다.
    this.firstPublishedAt = church.firstPublishedAt ? church.firstPublishedAt.toISOString() : null;
  }
}

export class OnchurchSubscriptionResponse {
  @ApiProperty({ type: Boolean, required: true, description: '구독 활성 여부 (체험 또는 결제)' })
  isActive: boolean;

  @ApiProperty({ type: Boolean, required: true, description: '무료 체험 중 여부' })
  isFreeTrial: boolean;

  @ApiProperty({ type: String, required: false, nullable: true, description: '무료 체험 종료 시각' })
  freeTrialUntil: string | null;

  @ApiProperty({ type: String, required: false, nullable: true, description: '결제 만료 시각' })
  paidUntil: string | null;

  constructor(user: OnchurchUser) {
    const now = Date.now();
    const isFreeTrial = !!(user.freeTrialUntil && user.freeTrialUntil.getTime() > now);
    const isPaid = !!(user.paidUntil && user.paidUntil.getTime() > now);
    this.isActive = isFreeTrial || isPaid;
    this.isFreeTrial = isFreeTrial;
    this.freeTrialUntil = user.freeTrialUntil ? user.freeTrialUntil.toISOString() : null;
    this.paidUntil = user.paidUntil ? user.paidUntil.toISOString() : null;
  }
}

export class OnchurchLiveStatusResponse {
  @ApiProperty({ type: Boolean, description: '현재 라이브 방송 중 여부(자동 종료 반영)' })
  isLive: boolean;

  @ApiProperty({ type: String, nullable: true, description: '현재 라이브 영상ID(watch?v=...)' })
  videoId: string | null;

  constructor(status: { isLive: boolean; videoId: string | null }) {
    this.isLive = status.isLive;
    this.videoId = status.videoId;
  }
}

export class OnchurchPublicChurchListItemResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) slug: string;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String, nullable: true }) eng: string | null;
  @ApiProperty({ type: String, nullable: true }) tagline: string | null;
  @ApiProperty({ type: String, nullable: true }) logoUrl: string | null;

  constructor(church: OnchurchChurch) {
    this.id = church.id;
    this.slug = church.slug;
    this.name = church.name;
    this.eng = church.eng;
    this.tagline = church.tagline;
    this.logoUrl = church.logoUrl;
  }
}

export class OnchurchPublicChurchListResponse {
  @ApiProperty({ type: [OnchurchPublicChurchListItemResponse] })
  churches: OnchurchPublicChurchListItemResponse[];

  constructor(churches: OnchurchChurch[]) {
    this.churches = churches.map((c) => new OnchurchPublicChurchListItemResponse(c));
  }
}

export class OnchurchMyChurchResponse {
  @ApiProperty({ type: OnchurchChurchResponse, required: false, nullable: true })
  church: OnchurchChurchResponse | null;

  @ApiProperty({ type: OnchurchSubscriptionResponse, required: true })
  subscription: OnchurchSubscriptionResponse;

  @ApiProperty({ type: String, enum: ['owner', 'admin', 'member'], required: false, nullable: true, description: '현재 사용자의 교회 내 등급 (관리자페이지 게이팅용)' })
  churchRole: 'owner' | 'admin' | 'member' | null;

  constructor(church: OnchurchChurch | null, user: OnchurchUser, churchRole: 'owner' | 'admin' | 'member' | null = null) {
    this.church = church ? new OnchurchChurchResponse(church) : null;
    this.subscription = new OnchurchSubscriptionResponse(user);
    this.churchRole = churchRole;
  }
}
