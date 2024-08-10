export class CommentDeleter {
  commentId: number;
  userId: number;

  constructor({ commendId, userId }: { commendId: number; userId: number }) {
    this.commentId = commendId;
    this.userId = userId;
  }
}
