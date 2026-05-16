import { ApiProperty } from '@nestjs/swagger';
import { OnchurchPrayerRequest, OnchurchPrayerStatus } from '@/onchurch/prayer/domain/entity/onchurch-prayer-request.entity';

export class OnchurchPrayerResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, nullable: true }) name: string | null;
  @ApiProperty({ type: String, nullable: true }) contact: string | null;
  @ApiProperty({ type: String }) category: string;
  @ApiProperty({ type: String }) scope: string;
  @ApiProperty({ type: String }) content: string;
  @ApiProperty({ type: Boolean }) isAnonymous: boolean;
  @ApiProperty({ type: String }) status: OnchurchPrayerStatus;
  @ApiProperty({ type: String }) createdAt: string;

  constructor(p: OnchurchPrayerRequest) {
    this.id = p.id;
    this.name = p.isAnonymous ? null : p.name;
    this.contact = p.isAnonymous ? null : p.contact;
    this.category = p.category;
    this.scope = p.scope;
    this.content = p.content;
    this.isAnonymous = p.isAnonymous;
    this.status = p.status;
    this.createdAt = p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt);
  }
}

// 관리자용 — 익명이어도 원본 name/contact 노출. (관리자에겐 실명/연락처를 볼 수 있어야 한다고 가정)
export class OnchurchPrayerAdminResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, nullable: true }) name: string | null;
  @ApiProperty({ type: String, nullable: true }) contact: string | null;
  @ApiProperty({ type: String }) category: string;
  @ApiProperty({ type: String }) scope: string;
  @ApiProperty({ type: String }) content: string;
  @ApiProperty({ type: Boolean }) isAnonymous: boolean;
  @ApiProperty({ type: String }) status: OnchurchPrayerStatus;
  @ApiProperty({ type: String }) createdAt: string;

  constructor(p: OnchurchPrayerRequest) {
    this.id = p.id;
    this.name = p.name;
    this.contact = p.contact;
    this.category = p.category;
    this.scope = p.scope;
    this.content = p.content;
    this.isAnonymous = p.isAnonymous;
    this.status = p.status;
    this.createdAt = p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt);
  }
}

export class OnchurchPrayerListResponse {
  @ApiProperty({ type: [OnchurchPrayerAdminResponse] })
  prayers: OnchurchPrayerAdminResponse[];

  constructor(items: OnchurchPrayerRequest[]) {
    this.prayers = items.map((p) => new OnchurchPrayerAdminResponse(p));
  }
}
