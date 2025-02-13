import { ApiProperty } from '@nestjs/swagger';
import { CommentResponse } from '@/comment/dto/response/comment.response';
import { CommentEntity } from '@/comment/comment.entity';

export class CommentsResponse {
  @ApiProperty({ type: [CommentResponse], required: true, description: '댓글 목록' })
  comments: CommentResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 댓글 수', example: 5 })
  totalCount: number;

  constructor(comments: CommentEntity[], totalCount: number) {
    this.comments = comments.map(comment => new CommentResponse(comment));
    this.totalCount = totalCount;
  }
}
