import { Injectable } from '@nestjs/common';
import { CommentRepository } from '@/comment/comment.repository';
import { PagingItems } from '@/common/type/type';
import { CommentFetcher } from '@/comment/repository/operation/comment.fetcher';
import { CommentCounter } from '@/comment/repository/operation/comment.counter';
import { CommentListQuery } from '@/comment/dto/query/comment-list.query';
import { CommentEntity } from '@/comment/comment.entity';
import { CreateCommentCommand } from '@/comment/dto/command/create-comment.command';
import { EditCommentCommand } from '@/comment/dto/command/edit-comment.command';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async creat(command: CreateCommentCommand) {
    return this.commentRepository.createOrThrow(command.toCreator());
  }

  async edit(command: EditCommentCommand) {
    return this.commentRepository.editOrThrow(command.toEditor());
  }

  async delete(commentId: number, userId: number) {
    return this.commentRepository.deleteOrThrow({
      commentId: commentId,
      userId: userId,
    });
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
