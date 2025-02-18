import { Injectable } from '@nestjs/common';
import { CommentRepository } from '@/comment/comment.repository';
import { PagingItems } from '@/common/type/type';
import { CommentFetcher } from '@/comment/repository/operation/comment.fetcher';
import { CommentCounter } from '@/comment/repository/operation/comment.counter';
import { CommentListQuery } from '@/comment/dto/query/comment-list.query';
import { COMMENT_TYPE, CommentEntity } from '@/comment/comment.entity';
import { CreateCommentCommand } from '@/comment/dto/command/create-comment.command';
import { EditCommentCommand } from '@/comment/dto/command/edit-comment.command';
import { PostRepository } from '@/post/repository/PostRepository';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async creat(command: CreateCommentCommand) {
    if (command.type === COMMENT_TYPE.POST) {
      const post = await this.postRepository.findOneByIdOrThrow(command.targetId);
      post.increaseCommentCount();
      await post.save();
    }
    return await this.commentRepository.createOrThrow(command.toCreator());
  }

  async edit(command: EditCommentCommand) {
    await this.commentRepository.editOrThrow(command.toEditor());
  }

  async delete(commentId: number, userId: number) {
    const comment = await this.commentRepository.findOneByIdAndUserIdOrThrow(commentId, userId);

    if (comment.type === COMMENT_TYPE.POST) {
      const post = await this.postRepository.findOneByIdOrThrow(comment.targetId);
      post.decreaseCommentCount();
      await post.save();
    }

    await comment.remove();
  }

  async getCommentList(query: CommentListQuery): Promise<PagingItems<CommentEntity>> {
    const fetcher = new CommentFetcher({
      targetId: query.targetId,
      parentId: query.parentId,
      type: query.type,
      paging: query.paging,
    });
    const commentList = await this.commentRepository.find(fetcher);

    const counter = new CommentCounter({
      targetId: query.targetId,
      parentId: query.parentId,
      type: query.type,
    });
    const totalCount = await this.commentRepository.count(counter);

    return { items: commentList, totalCount: totalCount };
  }
}
