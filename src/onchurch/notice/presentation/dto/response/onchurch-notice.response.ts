import { ApiProperty } from '@nestjs/swagger';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';

export class OnchurchNoticeResponse {
  @ApiProperty({ type: Number, required: true })
  id: number;

  @ApiProperty({ type: String, required: false, nullable: true })
  category: string | null;

  @ApiProperty({ type: String, required: true })
  title: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  content: string | null;

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
    this.category = notice.category;
    this.title = notice.title;
    this.content = notice.content;
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
