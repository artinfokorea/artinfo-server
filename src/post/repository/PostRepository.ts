import { Brackets, DataSource, Repository } from 'typeorm';
import { PostEntity } from '@/post/PostEntity';
import { Injectable } from '@nestjs/common';
import { PostNotFound } from '@/post/PostException';
import { PostPagingFetcher } from '@/post/repository/dto/PostPagingFetcher';
import { PagingItems } from '@/common/type/type';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }
  async findManyPaging(fetcher: PostPagingFetcher): Promise<PagingItems<PostEntity>> {
    const queryBuilder = this.createQueryBuilder('post') //
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.likes', 'likes');

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

  async findOneByIdWithUserOrThrow(postId: number) {
    return this.findOne({ relations: ['user', 'comments', 'likes'], where: { id: postId } }).then(result => {
      if (!result) throw new PostNotFound();
      return result;
    });
  }
}
