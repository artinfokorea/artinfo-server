import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { CommentService } from '@/comment/comment.service';
import { CommentsResponse } from '@/comment/dto/response/comments.response';
import { Body, Param, Query } from '@nestjs/common';
import { GetCommentsRequest } from '@/comment/dto/request/get-comments.request';
import { COMMENT_TYPE } from '@/comment/comment.entity';
import { CreateResponse } from '@/common/response/createResponse';
import { USER_TYPE } from '@/user/entity/user.entity';
import { CreateCommentRequest } from '@/comment/dto/request/create-comment.request';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { EditCommentRequest } from '@/comment/dto/request/edit-comment.request';
import { OkResponse } from '@/common/response/ok.response';

@RestApiController('/comments', 'Comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @RestApiGet(CommentsResponse, { path: '/news/:newsId', description: '댓글 목록 조회' })
  async getComments(@Param('newsId') newsId: number, @Query() request: GetCommentsRequest) {
    const comments = await this.commentService.getCommentList(request.toCommentListQuery(COMMENT_TYPE.NEWS, newsId));
    return new CommentsResponse(comments.items, comments.totalCount);
  }

  @RestApiPost(CreateResponse, { path: '/', description: '댓글 생성', auth: [USER_TYPE.CLIENT] })
  async createComment(@AuthSignature() signature: UserSignature, @Body() request: CreateCommentRequest) {
    return this.commentService.creat(request.toCreateCommentCommand(signature.id));
  }

  @RestApiPut(OkResponse, { path: '/:commentId', description: '댓글 수정', auth: [USER_TYPE.CLIENT] })
  async editComment(@AuthSignature() signature: UserSignature, @Param('commentId') commentId: number, @Body() request: EditCommentRequest) {
    await this.commentService.edit(request.toEditCommentCommand(commentId, signature.id));
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:commentId', description: '댓글 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteComment(@AuthSignature() signature: UserSignature, @Param('commentId') commentId: number) {
    await this.commentService.delete(commentId, signature.id);
    return new OkResponse();
  }
}
