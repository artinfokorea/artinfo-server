import { ApiProperty } from '@nestjs/swagger';
import { OnchurchCommunityPost } from '@/onchurch/community/domain/entity/onchurch-community-post.entity';
import { OnchurchCommunityCategory } from '@/onchurch/community/domain/entity/onchurch-community-category.entity';

// ── 카테고리 ─────────────────────────────────────────────
export class OnchurchCommunityCategoryResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: Number }) sortOrder: number;
  @ApiProperty({ type: Boolean }) isActive: boolean;

  constructor(c: OnchurchCommunityCategory) {
    this.id = c.id;
    this.name = c.name;
    this.sortOrder = c.sortOrder;
    this.isActive = c.isActive;
  }
}

export class OnchurchCommunityCategoryListResponse {
  @ApiProperty({ type: [OnchurchCommunityCategoryResponse] })
  categories: OnchurchCommunityCategoryResponse[];
  constructor(items: OnchurchCommunityCategory[]) {
    this.categories = items.map((c) => new OnchurchCommunityCategoryResponse(c));
  }
}

// ── 게시글 (공개/작성자) ─────────────────────────────────
export class OnchurchCommunityPostResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, nullable: true }) category: string | null;
  @ApiProperty({ type: String }) authorName: string;
  @ApiProperty({ type: Number }) authorId: number;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String, nullable: true }) content: string | null;
  @ApiProperty({ type: [String] }) photoUrls: string[];
  @ApiProperty({ type: String, nullable: true }) videoUrl: string | null;
  @ApiProperty({ type: String }) createdAt: string;

  constructor(post: OnchurchCommunityPost) {
    this.id = post.id;
    this.category = post.category;
    this.authorName = post.authorName;
    this.authorId = post.authorId;
    this.title = post.title;
    this.content = post.content;
    this.photoUrls = post.photoUrls ?? [];
    this.videoUrl = post.videoUrl;
    this.createdAt = post.createdAt.toISOString();
  }
}

export class OnchurchPublicCommunityPostListResponse {
  @ApiProperty({ type: [OnchurchCommunityPostResponse] })
  posts: OnchurchCommunityPostResponse[];

  @ApiProperty({ type: Number })
  totalCount: number;

  constructor(items: OnchurchCommunityPost[], totalCount: number) {
    this.posts = items.map((p) => new OnchurchCommunityPostResponse(p));
    this.totalCount = totalCount;
  }
}

// ── 게시글 (관리자 사후 관리: 숨김/신고 노출) ─────────────
export class OnchurchCommunityPostManageResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, nullable: true }) category: string | null;
  @ApiProperty({ type: String }) authorName: string;
  @ApiProperty({ type: Number }) authorId: number;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String, nullable: true }) content: string | null;
  @ApiProperty({ type: [String] }) photoUrls: string[];
  @ApiProperty({ type: String, nullable: true }) videoUrl: string | null;
  @ApiProperty({ type: Boolean }) isHidden: boolean;
  @ApiProperty({ type: Number }) reportCount: number;
  @ApiProperty({ type: String }) createdAt: string;

  constructor(post: OnchurchCommunityPost) {
    this.id = post.id;
    this.category = post.category;
    this.authorName = post.authorName;
    this.authorId = post.authorId;
    this.title = post.title;
    this.content = post.content;
    this.photoUrls = post.photoUrls ?? [];
    this.videoUrl = post.videoUrl;
    this.isHidden = post.isHidden;
    this.reportCount = post.reportCount;
    this.createdAt = post.createdAt.toISOString();
  }
}

export class OnchurchCommunityPostManageListResponse {
  @ApiProperty({ type: [OnchurchCommunityPostManageResponse] })
  posts: OnchurchCommunityPostManageResponse[];

  constructor(items: OnchurchCommunityPost[]) {
    this.posts = items.map((p) => new OnchurchCommunityPostManageResponse(p));
  }
}
