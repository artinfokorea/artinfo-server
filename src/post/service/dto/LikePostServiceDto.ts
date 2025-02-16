export class LikePostServiceDto {
  userId: number;
  postId: number;
  isLike: boolean;

  constructor({ userId, postId, isLike }: { userId: number; postId: number; isLike: boolean }) {
    this.userId = userId;
    this.postId = postId;
    this.isLike = isLike;
  }
}
