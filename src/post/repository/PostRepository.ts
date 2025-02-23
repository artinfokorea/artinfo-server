import { Brackets, DataSource, Repository } from 'typeorm';
import { PostEntity } from '@/post/PostEntity';
import { Injectable } from '@nestjs/common';
import { PostNotFound } from '@/post/PostException';
import { PostPagingFetcher } from '@/post/repository/dto/PostPagingFetcher';
import { PagingItems } from '@/common/type/type';
import { User } from '@/user/entity/user.entity';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  findTop() {
    return this.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoin('post.likes', 'likes')
      .leftJoin('post.comments', 'comments')
      .addSelect('COUNT(likes.id)', 'likesCount')
      .addSelect('COUNT(comments.id)', 'commentsCount')
      .groupBy('post.id')
      .addGroupBy('user.id')
      .orderBy('COUNT(likes.id) + COUNT(comments.id)', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .take(10)
      .getRawMany()
      .then(result => {
        return result.map(rawPost => {
          const user = new User().fromRaw({
            user_id: rawPost['user_id'],
            user_type: rawPost['user_type'],
            user_name: rawPost['user_name'],
            user_nickname: rawPost['user_nickname'],
            user_email: rawPost['user_email'],
            user_phone: rawPost['user_phone'],
            user_birth: rawPost['user_birth'],
            user_password: rawPost['user_password'],
            user_icon_image_url: rawPost['user_icon_image_url'],
            user_created_at: rawPost['user_created_at'],
            user_updated_at: rawPost['user_updated_at'],
            user_deleted_at: rawPost['user_deleted_at'],
          });

          const postEntity: Partial<PostEntity> = {
            id: rawPost['post_id'],
            userId: rawPost['post_user_id'],
            user: user,
            category: rawPost['post_category'],
            title: rawPost['post_title'],
            contents: rawPost['post_contents'],
            thumbnailImageUrl: rawPost['post_thumbnail_image_url'],
            viewCount: rawPost['post_view_count'],
            createdAt: rawPost['post_created_at'],
            updateAt: rawPost['post_updated_at'],
            deletedAt: rawPost['post_deleted_at'],
            likesCount: Number(rawPost['likesCount']),
            commentsCount: Number(rawPost['commentsCount']),
          };

          return new PostEntity(postEntity);
        });
      });
  }

  async findManyPaging(fetcher: PostPagingFetcher): Promise<PagingItems<PostEntity>> {
    const queryBuilder = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments') //
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.user', 'user');

    if (fetcher.category) {
      queryBuilder.where('post.category = :category', { category: fetcher.category });
    }

    if (fetcher.keyword) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('LOWER(post.title) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` }) //
            .orWhere('LOWER(post.contents) LIKE LOWER(:keyword)', {
              keyword: `%${fetcher.keyword}%`,
            });
        }),
      );
    }

    const [posts, totalCount] = await queryBuilder //
      .orderBy('post.createdAt', 'DESC')
      .skip(fetcher.skip)
      .take(fetcher.take)
      .getManyAndCount();

    return { items: posts, totalCount: totalCount };
  }

  async findOneByIdAndUserIdOrThrow(postId: number, userId: number) {
    return this.findOneBy({ id: postId, userId: userId }).then(result => {
      if (!result) throw new PostNotFound();
      return result;
    });
  }

  async findOneByIdOrThrow(postId: number) {
    return this.findOneBy({ id: postId }).then(result => {
      if (!result) throw new PostNotFound();
      return result;
    });
  }

  async findOneByIdWithUserOrThrow(postId: number) {
    return this.findOne({ relations: ['user', 'comments', 'likes'], where: { id: postId } }).then(result => {
      if (!result) throw new PostNotFound();
      return result;
    });
  }
}
