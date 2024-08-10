import { CommentEditor } from '@/comment/repository/operation/comment.editor';

export class EditCommentCommand {
  commentId: number;
  userId: number;
  contents: string;

  constructor({ commentId, userId, contents }: { commentId: number; userId: number; contents: string }) {
    this.commentId = commentId;
    this.userId = userId;
    this.contents = contents;
  }

  toEditor() {
    return new CommentEditor({
      commentId: this.commentId,
      userId: this.userId,
      contents: this.contents,
    });
  }
}
