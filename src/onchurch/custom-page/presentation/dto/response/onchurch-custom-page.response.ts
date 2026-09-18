import { ApiProperty } from '@nestjs/swagger';
import { OnchurchCustomPage, OnchurchCustomPageBlock } from '@/onchurch/custom-page/domain/entity/onchurch-custom-page.entity';

export class OnchurchCustomPageResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, description: '공개 URL 경로(/p/:slug)' }) slug: string;
  @ApiProperty({ type: String, description: '네비게이션에 노출되는 페이지 이름' }) title: string;
  @ApiProperty({ type: String, nullable: true, description: '제목 아래 한 줄 설명' }) summary: string | null;
  @ApiProperty({ type: [Object], description: '본문 블록 배열' }) blocks: OnchurchCustomPageBlock[];
  @ApiProperty({ type: Number, description: '커스텀 페이지들끼리의 노출 순서' }) sortOrder: number;
  @ApiProperty({ type: Boolean, description: '공개 사이트 노출 여부' }) isActive: boolean;

  constructor(p: OnchurchCustomPage) {
    this.id = p.id;
    this.slug = p.slug;
    this.title = p.title;
    this.summary = p.summary ?? null;
    this.blocks = p.blocks ?? [];
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}

export class OnchurchCustomPageListResponse {
  @ApiProperty({ type: [OnchurchCustomPageResponse] })
  pages: OnchurchCustomPageResponse[];

  constructor(items: OnchurchCustomPage[]) {
    this.pages = items.map(p => new OnchurchCustomPageResponse(p));
  }
}
