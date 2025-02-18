import { ApiProperty } from '@nestjs/swagger';
import { PostResponse } from '@/post/controller/dto/response/PostResponse';
import { PostEntity } from '@/post/PostEntity';

export class TopPostsResponse {
  @ApiProperty({ type: [PostResponse], required: true, description: '글 목록' })
  posts: PostResponse[];

  constructor(posts: PostEntity[]) {
    this.posts = posts.map(post => new PostResponse(post));
  }
}
