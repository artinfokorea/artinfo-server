import { ApiProperty } from '@nestjs/swagger';
import { AzeyoCommunityComment } from '@/azeyo/community/domain/entity/azeyo-community-comment.entity';

export class AzeyoCommunityCommentResponse {
  @ApiProperty() id: number;
  @ApiProperty() contents: string;
  @ApiProperty() userId: number;
  @ApiProperty() userNickname: string;
  @ApiProperty() userIconImageUrl: string | null;
  @ApiProperty() childrenCount: number;
  @ApiProperty() createdAt: Date;

  constructor(comment: AzeyoCommunityComment) {
    this.id = comment.id;
    this.contents = comment.contents;
    this.userId = comment.user?.id ?? comment.userId;
    this.userNickname = comment.user?.nickname ?? '';
    this.userIconImageUrl = comment.user?.iconImageUrl ?? null;
    this.childrenCount = comment.childrenCount ?? 0;
    this.createdAt = comment.createdAt;
  }
}

export class AzeyoCommunityCommentsResponse {
  @ApiProperty({ type: [AzeyoCommunityCommentResponse] }) comments: AzeyoCommunityCommentResponse[];
  @ApiProperty() totalCount: number;

  constructor(comments: AzeyoCommunityComment[], totalCount: number) {
    this.comments = comments.map(c => new AzeyoCommunityCommentResponse(c));
    this.totalCount = totalCount;
  }
}
