import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '@/comment/comment.entity';
import { CommentFetcher } from '@/comment/repository/operation/comment.fetcher';
import { CommentCounter } from '@/comment/repository/operation/comment.counter';
import { User } from '@/user/entity/user.entity';
import { CommentCreator } from '@/comment/repository/operation/comment.creator';
import { UserRepository } from '@/user/repository/user.repository';
import { CommentEditor } from '@/comment/repository/operation/comment.editor';
import { CommentForbidden, CommentNotFound } from '@/comment/comment.exception';
import { CommentDeleter } from '@/comment/repository/operation/comment.deleter';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private userRepository: UserRepository,
  ) {}

  async createOrThrow(creator: CommentCreator): Promise<number> {
    const user = await this.userRepository.findOneOrThrowById(creator.userId);

    if (creator.parentId) {
      const parentComment = await this.commentRepository.findOneBy({ id: creator.parentId, type: creator.type });
      if (!parentComment) throw new CommentNotFound();
    }

    const comment = await this.commentRepository.save({
      type: creator.type,
      targetId: creator.targetId,
      parentId: creator.parentId,
      contents: creator.contents,
      user: user,
    });

    return comment.id;
  }

  async editOrThrow(editor: CommentEditor): Promise<void> {
    const comment = await this.commentRepository.findOne({ relations: ['user'], where: { id: editor.commentId, user: { id: editor.userId } } });
    if (!comment) {
      throw new CommentNotFound();
    } else if (comment.user.id !== editor.userId) {
      throw new CommentForbidden();
    }

    await this.commentRepository.update(
      { id: editor.commentId },
      {
        contents: editor.contents,
      },
    );
  }

  async deleteOrThrow(deleter: CommentDeleter) {
    const comment = await this.commentRepository.findOne({ relations: ['user'], where: { id: deleter.commentId, user: { id: deleter.userId } } });
    if (!comment) {
      throw new CommentNotFound();
    } else if (comment.user.id !== deleter.userId) {
      throw new CommentForbidden();
    }

    await this.commentRepository
      .createQueryBuilder()
      .delete()
      .from(Comment)
      .where('id = :id OR parentId = :parentId', { id: deleter.commentId, parentId: deleter.commentId })
      .execute();
  }

  async find(fetcher: CommentFetcher): Promise<Comment[]> {
    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .addSelect(subQuery => {
        return subQuery.select('COUNT(*)', 'childrenCount').from(Comment, 'child').where('child.parentId = comment.id');
      }, 'children_count')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.targetId = :targetId', { targetId: fetcher.targetId })
      .andWhere('comment.type = :type', { type: fetcher.type });

    if (fetcher.parentId) {
      qb.andWhere('comment.parentId = :parentId', { parentId: fetcher.parentId }).orderBy('comment.createdAt', 'ASC');
    } else {
      qb.andWhere('comment.parentId IS NULL').orderBy('comment.createdAt', 'DESC');
    }

    const rawComments = await qb.offset(fetcher.skip).limit(fetcher.take).getRawMany();

    return rawComments.map((raw: any) => {
      const comment = new Comment().fromRaw(raw);
      const user = new User().fromRaw(raw);
      comment.setUser(user);

      return comment;
    });
  }

  async count(counter: CommentCounter): Promise<number> {
    const qb = this.commentRepository
      .createQueryBuilder('comment') //
      .where('comment.targetId = :targetId', { targetId: counter.targetId })
      .andWhere('comment.type = :type', { type: counter.type });

    if (counter.parentId) {
      qb.andWhere('comment.parentId = :parentId', { parentId: counter.parentId }).orderBy('comment.createdAt', 'ASC');
    } else {
      qb.andWhere('comment.parentId IS NULL').orderBy('comment.createdAt', 'DESC');
    }

    return qb.getCount();
  }
}
