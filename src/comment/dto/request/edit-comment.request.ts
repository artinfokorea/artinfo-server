import { ApiProperty } from '@nestjs/swagger';
import { EditCommentCommand } from '@/comment/dto/command/edit-comment.command';

export class EditCommentRequest {
  @ApiProperty({ type: String, required: true, description: '댓글 내용', example: '댓글입니다.' })
  contents: string;

  toEditCommentCommand(commentId: number, userId: number) {
    return new EditCommentCommand({
      commentId: commentId,
      contents: this.contents,
      userId: userId,
    });
  }
}
