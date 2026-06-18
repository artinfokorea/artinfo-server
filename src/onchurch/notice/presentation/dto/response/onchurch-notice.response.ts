import { ApiProperty } from '@nestjs/swagger';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';
import { OnchurchNoticeCategory } from '@/onchurch/notice/domain/entity/onchurch-notice-category.entity';

export class OnchurchNoticeCategoryResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: Number }) sortOrder: number;
  @ApiProperty({ type: Boolean }) isActive: boolean;
  @ApiProperty({ type: Boolean, description: "'전체' 보기 특수 카테고리 여부" }) isAll: boolean;

  constructor(c: OnchurchNoticeCategory) {
    this.id = c.id;
    this.name = c.name;
    this.sortOrder = c.sortOrder;
    this.isActive = c.isActive;
    this.isAll = c.isAll;
  }
}

export class OnchurchNoticeCategoryListResponse {
  @ApiProperty({ type: [OnchurchNoticeCategoryResponse] })
  categories: OnchurchNoticeCategoryResponse[];
  constructor(items: OnchurchNoticeCategory[]) {
    this.categories = items.map(c => new OnchurchNoticeCategoryResponse(c));
  }
}

export class OnchurchNoticeResponse {
  @ApiProperty({ type: Number, required: true })
  id: number;

  @ApiProperty({ type: Number, required: false, nullable: true, description: '교회별 게시판 순번' })
  seqNo: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  category: string | null;

  @ApiProperty({ type: String, required: true })
  title: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  content: string | null;

  @ApiProperty({ type: [String], required: true, description: '첨부 이미지 URL 목록' })
  imageUrls: string[];

  @ApiProperty({ type: String, required: false, nullable: true })
  author: string | null;

  @ApiProperty({ type: Boolean, required: true })
  isPinned: boolean;

  @ApiProperty({ type: Boolean, required: true })
  isActive: boolean;

  @ApiProperty({ type: String, required: false, nullable: true })
  publishedAt: string | null;

  @ApiProperty({ type: String, required: true })
  createdAt: string;

  constructor(notice: OnchurchNotice) {
    this.id = notice.id;
    this.seqNo = notice.seqNo ?? null;
    this.category = notice.category;
    this.title = notice.title;
    this.content = notice.content;
    this.imageUrls = notice.imageUrls ?? [];
    this.author = notice.author;
    this.isPinned = notice.isPinned;
    this.isActive = notice.isActive;
    this.publishedAt = notice.publishedAt ? notice.publishedAt.toISOString() : null;
    this.createdAt = notice.createdAt.toISOString();
  }
}

export class OnchurchNoticeListResponse {
  @ApiProperty({ type: [OnchurchNoticeResponse], required: true })
  notices: OnchurchNoticeResponse[];

  constructor(notices: OnchurchNotice[]) {
    this.notices = notices.map(n => new OnchurchNoticeResponse(n));
  }
}

export class OnchurchPublicNoticeListResponse {
  @ApiProperty({ type: [OnchurchNoticeResponse], required: true })
  notices: OnchurchNoticeResponse[];

  @ApiProperty({ type: Number, required: true })
  totalCount: number;

  constructor(items: OnchurchNotice[], totalCount: number) {
    this.notices = items.map(n => new OnchurchNoticeResponse(n));
    this.totalCount = totalCount;
  }
}
