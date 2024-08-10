import { COMMENT_TYPE } from '@/comment/comment.entity';

export class CommentCreator {
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
}
