import { Injectable } from '@nestjs/common';
import { PostRepository } from '@/post/repository/PostRepository';
import { CreatePostServiceDto } from '@/post/service/dto/CreatePostServiceDto';
import { PostEntity } from '@/post/PostEntity';
import { UserRepository } from '@/user/repository/user.repository';
import { LikeRepository } from '@/like/LikeRepository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly likeRepository: LikeRepository,
  ) {}

  async createPost(dto: CreatePostServiceDto): Promise<number> {
    const post = await this.postRepository.save(PostEntity.fromCreator(dto.toCreator()));
    return post.id;
  }

  async removePost(userId: number, postId: number) {
    await this.userRepository.findOneOrThrowById(userId);
    const post = await this.postRepository.findOneByIdAndUserIdOrThrow(postId, userId);
    await this.postRepository.softRemove(post);
  }

  async scanPostById(postId: number, userId?: number) {
    const post = await this.postRepository.findOneByIdWithUserOrThrow(postId);

    if (userId) {
      const like = await this.likeRepository.findBy({ targetId: postId, userId: userId });
      if (like) post.hasLike();
    }

    return post;
  }
}
