import { Injectable } from '@nestjs/common';
import { PostRepository } from '@/post/repository/PostRepository';
import { CreatePostServiceDto } from '@/post/service/dto/CreatePostServiceDto';
import { PostEntity } from '@/post/PostEntity';
import { UserRepository } from '@/user/repository/user.repository';
import { LikeRepository } from '@/like/LikeRepository';
import { EditPostServiceDto } from '@/post/service/dto/EditPostServiceDto';
import { PagingItems } from '@/common/type/type';
import { ScanPostsServiceDto } from '@/post/service/dto/ScanPostsServiceDto';
import { LikeEntity } from '@/like/LikeEntity';
import { LikePostServiceDto } from '@/post/service/dto/LikePostServiceDto';
import { LikeTypeEnum } from '@/like/LikeTypeEnum';

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

  async scanPosts(dto: ScanPostsServiceDto): Promise<PagingItems<PostEntity>> {
    const pagingItems = await this.postRepository.findManyPaging(dto.toFetcher());

    let likes: LikeEntity[] = [];
    if (dto.userId) {
      likes = await this.likeRepository.findManyInTargetIdsAndUserId(
        pagingItems.items.map(item => item.id),
        dto.userId,
      );

      const likesMap: Map<number, boolean> = new Map();
      likes.forEach(like => {
        likesMap.set(like.targetId, true);
      });

      pagingItems.items = pagingItems.items.map(item => {
        if (likesMap.get(item.id)) item.hasLike();
        return item;
      });
    }

    return { items: pagingItems.items, totalCount: pagingItems.totalCount };
  }

  async editPost(dto: EditPostServiceDto): Promise<void> {
    const post = await this.postRepository.findOneByIdAndUserIdOrThrow(dto.postId, dto.userId);
    post.edit(dto.toEditor());
    await post.save();
  }

  async likePost(dto: LikePostServiceDto) {
    await this.userRepository.findOneOrThrowById(dto.userId);

    const like = await this.likeRepository.findOneBy({ userId: dto.userId, targetId: dto.postId, type: LikeTypeEnum.POST });
    if (!dto.isLike && like) {
      await like.softRemove();
    } else if (dto.isLike && !like) {
      await this.likeRepository.save({
        type: LikeTypeEnum.POST,
        userId: dto.userId,
        targetId: dto.postId,
      });
    }
  }
}
