import { COMMENT_TYPE } from '@/comment/comment.entity';

export class CommentCounter {
  targetId: number;
  parentId: number | null = null;
  type: COMMENT_TYPE;

  constructor({ targetId, parentId, type }: { targetId: number; parentId: number | null; type: COMMENT_TYPE }) {
    this.targetId = targetId;
    this.parentId = parentId;
    this.type = type;
  }
}
