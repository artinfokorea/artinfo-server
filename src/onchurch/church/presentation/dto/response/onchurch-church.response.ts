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

  @ApiProperty({ type: [String], required: true })
  enabledPages: string[];

  @ApiProperty({ type: Boolean, required: true, description: '사이트 운영 중 여부' })
  isPublished: boolean;

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
    this.enabledPages = church.enabledPages ?? [];
    this.isPublished = church.isPublished ?? false;
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

export class OnchurchMyChurchResponse {
  @ApiProperty({ type: OnchurchChurchResponse, required: false, nullable: true })
  church: OnchurchChurchResponse | null;

  @ApiProperty({ type: OnchurchSubscriptionResponse, required: true })
  subscription: OnchurchSubscriptionResponse;

  constructor(church: OnchurchChurch | null, user: OnchurchUser) {
    this.church = church ? new OnchurchChurchResponse(church) : null;
    this.subscription = new OnchurchSubscriptionResponse(user);
  }
}
