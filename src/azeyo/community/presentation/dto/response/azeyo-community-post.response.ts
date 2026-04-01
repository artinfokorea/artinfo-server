import { ApiProperty } from '@nestjs/swagger';
import { AzeyoCommunityPost, AZEYO_COMMUNITY_CATEGORY, AZEYO_COMMUNITY_POST_TYPE } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

export class AzeyoCommunityPostResponse {
  @ApiProperty() id: number;
  @ApiProperty() type: AZEYO_COMMUNITY_POST_TYPE;
  @ApiProperty() category: AZEYO_COMMUNITY_CATEGORY;
  @ApiProperty() authorId: number;
  @ApiProperty() authorName: string;
  @ApiProperty() authorIconImageUrl: string | null;
  @ApiProperty() title: string;
  @ApiProperty() contents: string;
  @ApiProperty() imageUrls: string[] | null;
  @ApiProperty() imageRatio: string | null;
  @ApiProperty() voteOptionA: string | null;
  @ApiProperty() voteOptionB: string | null;
  @ApiProperty() voteCountA: number;
  @ApiProperty() voteCountB: number;
  @ApiProperty() viewCount: number;
  @ApiProperty() likeCount: number;
  @ApiProperty() commentCount: number;
  @ApiProperty() isLiked: boolean;
  @ApiProperty() userVote: 'A' | 'B' | null;
  @ApiProperty() createdAt: Date;

  constructor(post: AzeyoCommunityPost) {
    this.id = post.id;
    this.type = post.type;
    this.category = post.category;
    this.authorId = post.user?.id ?? post.userId;
    this.authorName = post.user?.nickname ?? '';
    this.authorIconImageUrl = post.user?.iconImageUrl ?? null;
    this.title = post.title;
    this.contents = post.contents;
    this.imageUrls = post.imageUrls;
    this.imageRatio = post.imageRatio;
    this.voteOptionA = post.voteOptionA;
    this.voteOptionB = post.voteOptionB;
    this.voteCountA = post.voteCountA;
    this.voteCountB = post.voteCountB;
    this.viewCount = post.viewCount;
    this.likeCount = post.likesCount;
    this.commentCount = post.commentsCount;
    this.isLiked = post.isLiked;
    this.userVote = post.userVote;
    this.createdAt = post.createdAt;
  }
}

export class AzeyoCommunityPostsResponse {
  @ApiProperty({ type: [AzeyoCommunityPostResponse] }) posts: AzeyoCommunityPostResponse[];
  @ApiProperty() totalCount: number;

  constructor({ items, totalCount }: { items: AzeyoCommunityPost[]; totalCount: number }) {
    this.posts = items.map(p => new AzeyoCommunityPostResponse(p));
    this.totalCount = totalCount;
  }
}
