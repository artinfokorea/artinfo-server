import { ApiProperty } from '@nestjs/swagger';
import { LikePostServiceDto } from '@/post/service/dto/LikePostServiceDto';

export class LikePostRequest {
  @ApiProperty({ type: Boolean, required: true, description: '좋아요 여부', example: true })
  isLike: boolean;

  toServiceDto(userId: number, postId: number) {
    return new LikePostServiceDto({
      userId: userId,
      postId: postId,
      isLike: this.isLike,
    });
  }
}
