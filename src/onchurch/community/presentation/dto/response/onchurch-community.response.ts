import { ApiProperty } from '@nestjs/swagger';
import { OnchurchCommunityPost } from '@/onchurch/community/domain/entity/onchurch-community-post.entity';
import { OnchurchCommunityCategory } from '@/onchurch/community/domain/entity/onchurch-community-category.entity';
import { OnchurchCommunityComment } from '@/onchurch/community/domain/entity/onchurch-community-comment.entity';

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
  @ApiProperty({ type: String }) photoRatio: string;
  @ApiProperty({ type: String, nullable: true }) videoUrl: string | null;
  @ApiProperty({ type: Number, description: '댓글 수' }) commentCount: number;
  @ApiProperty({ type: String }) createdAt: string;

  constructor(post: OnchurchCommunityPost, commentCount = 0) {
    this.id = post.id;
    this.category = post.category;
    this.authorName = post.authorName;
    this.authorId = post.authorId;
    this.title = post.title;
    this.content = post.content;
    this.photoUrls = post.photoUrls ?? [];
    this.photoRatio = post.photoRatio ?? '1:1';
    this.videoUrl = post.videoUrl;
    this.commentCount = commentCount;
    this.createdAt = post.createdAt.toISOString();
  }
}

export class OnchurchPublicCommunityPostListResponse {
  @ApiProperty({ type: [OnchurchCommunityPostResponse] })
  posts: OnchurchCommunityPostResponse[];

  @ApiProperty({ type: Number })
  totalCount: number;

  constructor(items: OnchurchCommunityPost[], totalCount: number, commentCounts?: Map<number, number>) {
    this.posts = items.map((p) => new OnchurchCommunityPostResponse(p, commentCounts?.get(p.id) ?? 0));
    this.totalCount = totalCount;
  }
}

// ── 댓글 ─────────────────────────────────────────────────
export class OnchurchCommunityCommentResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: Number }) postId: number;
  @ApiProperty({ type: Number }) authorId: number;
  @ApiProperty({ type: String }) authorName: string;
  @ApiProperty({ type: String }) content: string;
  @ApiProperty({ type: String }) createdAt: string;

  constructor(c: OnchurchCommunityComment) {
    this.id = c.id;
    this.postId = c.postId;
    this.authorId = c.authorId;
    this.authorName = c.authorName;
    this.content = c.content;
    this.createdAt = c.createdAt.toISOString();
  }
}

export class OnchurchCommunityCommentListResponse {
  @ApiProperty({ type: [OnchurchCommunityCommentResponse] })
  comments: OnchurchCommunityCommentResponse[];

  constructor(items: OnchurchCommunityComment[]) {
    this.comments = items.map((c) => new OnchurchCommunityCommentResponse(c));
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
  @ApiProperty({ type: String }) photoRatio: string;
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
    this.photoRatio = post.photoRatio ?? '1:1';
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
