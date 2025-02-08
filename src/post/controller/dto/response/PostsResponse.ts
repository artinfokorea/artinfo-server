import { ApiProperty } from '@nestjs/swagger';
import { PostResponse } from '@/post/controller/dto/response/PostResponse';
import { PostEntity } from '@/post/PostEntity';

export class PostsResponse {
  @ApiProperty({ type: [PostResponse], required: true, description: '글 목록' })
  posts: PostResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ posts, totalCount }: { posts: PostEntity[]; totalCount: number }) {
    this.posts = posts.map(post => new PostResponse(post));
    this.totalCount = totalCount;
  }
}
