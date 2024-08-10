import { List, Paging } from '@/common/type/type';
import { CommentListQuery } from '@/comment/dto/query/comment-list.query';
import { COMMENT_TYPE } from '@/comment/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class GetCommentsRequest extends List {
  @ApiProperty({ type: Number, required: false, description: '부모 댓글 아이디', example: 1 })
  parentId: number | null;

  toCommentListQuery(type: COMMENT_TYPE, newId: number) {
    const paging: Paging = { page: this.page, size: this.size };
    return new CommentListQuery({
      targetId: newId,
      parentId: this.parentId,
      type: type,
      paging: paging,
    });
  }
}
