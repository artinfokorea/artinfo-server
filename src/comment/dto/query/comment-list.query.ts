import { COMMENT_TYPE } from '@/comment/comment.entity';
import { Paging } from '@/common/type/type';

export class CommentListQuery {
  targetId: number;
  parentId: number | null = null;
  type: COMMENT_TYPE;
  paging: Paging;

  constructor({ targetId, parentId, type, paging }: { targetId: number; parentId: number | null; type: COMMENT_TYPE; paging: Paging }) {
    this.paging = paging;
    this.targetId = targetId;
    this.parentId = parentId;
    this.type = type;
  }
}
