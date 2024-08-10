export class CommentEditor {
  commentId: number;
  userId: number;
  contents: string;

  constructor({ commentId, userId, contents }: { commentId: number; userId: number; contents: string }) {
    this.commentId = commentId;
    this.userId = userId;
    this.contents = contents;
  }
}
