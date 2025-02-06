import { DataSource, Repository } from 'typeorm';
import { PostEntity } from '@/post/PostEntity';
import { Injectable } from '@nestjs/common';
import { PostNotFound } from '@/post/post.exception';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  async findOneByIdAndUserIdOrThrow(postId: number, userId: number) {
    return this.findOneBy({ id: postId, userId: userId }).then(result => {
      if (!result) throw new PostNotFound();
      return result;
    });
  }

  async findOneByIdWithUserOrThrow(postId: number) {
    return this.findOne({ relations: ['user'], where: { id: postId } }).then(result => {
      if (!result) throw new PostNotFound();
      return result;
    });
  }
}
