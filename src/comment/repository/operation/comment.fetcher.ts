import { COMMENT_TYPE } from '@/comment/comment.entity';
import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';

export class CommentFetcher extends PagingOperation {
  targetId: number;
  parentId: number | null = null;
  type: COMMENT_TYPE;

  constructor({ targetId, parentId, type, paging }: { targetId: number; parentId: number | null; type: COMMENT_TYPE; paging: Paging }) {
    super({ page: paging.page, size: paging.size });
    this.targetId = targetId;
    this.parentId = parentId;
    this.type = type;
  }
}
