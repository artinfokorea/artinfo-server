import { ApiProperty } from '@nestjs/swagger';
import { COMMENT_TYPE } from '@/comment/comment.entity';
import { Enum } from '@/common/decorator/validator';
import { CreateCommentCommand } from '@/comment/dto/command/create-comment.command';

export class CreateCommentRequest {
  @Enum(COMMENT_TYPE)
  @ApiProperty({ enum: COMMENT_TYPE, enumName: 'COMMENT_TYPE', required: true, description: '댓글 타입', example: COMMENT_TYPE.NEWS })
  type: COMMENT_TYPE;

  @ApiProperty({ type: Number, required: true, description: '댓글 타겟 아이디', example: 1 })
  targetId: number;

  @ApiProperty({ type: 'number | null', required: false, description: '부모 댓글 아이디', example: 1 })
  parentId: number | null;

  @ApiProperty({ type: String, required: true, description: '댓글 내용', example: '댓글입니다.' })
  contents: string;

  toCreateCommentCommand(userId: number) {
    return new CreateCommentCommand({
      type: this.type,
      targetId: this.targetId,
      parentId: this.parentId,
      contents: this.contents,
      userId: userId,
    });
  }
}
