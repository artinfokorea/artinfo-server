import { COMMENT_TYPE } from '@/comment/comment.entity';
import { CommentCreator } from '@/comment/repository/operation/comment.creator';

export class CreateCommentCommand {
  type: COMMENT_TYPE;
  targetId: number;
  parentId: number | null;
  contents: string;
  userId: number;

  constructor({
    type,
    targetId,
    parentId,
    contents,
    userId,
  }: {
    type: COMMENT_TYPE;
    targetId: number;
    parentId: number | null;
    contents: string;
    userId: number;
  }) {
    this.type = type;
    this.targetId = targetId;
    this.parentId = parentId;
    this.contents = contents;
    this.userId = userId;
  }

  toCreator() {
    return new CommentCreator({
      type: this.type,
      targetId: this.targetId,
      parentId: this.parentId,
      contents: this.contents,
      userId: this.userId,
    });
  }
}
