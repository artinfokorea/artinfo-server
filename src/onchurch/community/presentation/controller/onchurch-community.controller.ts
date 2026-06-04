import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchCreateMyCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-create-my-community-post.usecase';
import { OnchurchUpdateMyCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-update-my-community-post.usecase';
import { OnchurchDeleteMyCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-delete-my-community-post.usecase';
import {
  OnchurchListManageCommunityPostsUseCase,
  OnchurchSetHiddenCommunityPostUseCase,
  OnchurchDeleteManageCommunityPostUseCase,
} from '@/onchurch/community/application/usecase/onchurch-manage-community-posts.usecase';
import { OnchurchCommunityPostWriteRequest } from '@/onchurch/community/presentation/dto/request/onchurch-community-post-write.request';
import { OnchurchCommunityPostHideRequest } from '@/onchurch/community/presentation/dto/request/onchurch-community-post-hide.request';
import {
  OnchurchCommunityPostResponse,
  OnchurchCommunityPostManageListResponse,
  OnchurchCommunityPostManageResponse,
} from '@/onchurch/community/presentation/dto/response/onchurch-community.response';

@RestApiController('/onchurch/community-posts', 'Onchurch Community')
export class OnchurchCommunityController {
  constructor(
    private readonly createUseCase: OnchurchCreateMyCommunityPostUseCase,
    private readonly updateUseCase: OnchurchUpdateMyCommunityPostUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyCommunityPostUseCase,
    private readonly listManageUseCase: OnchurchListManageCommunityPostsUseCase,
    private readonly setHiddenUseCase: OnchurchSetHiddenCommunityPostUseCase,
    private readonly deleteManageUseCase: OnchurchDeleteManageCommunityPostUseCase,
  ) {}

  // ── 성도 본인 작성/수정/삭제 ──────────────────────────
  @RestApiPost(OnchurchCommunityPostResponse, { path: '/me', description: '성도 - 교제 게시글 작성', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchCommunityPostWriteRequest) {
    const post = await this.createUseCase.execute(signature.id, request.toCommand());
    return new OnchurchCommunityPostResponse(post);
  }

  @RestApiPut(OnchurchCommunityPostResponse, { path: '/me/:id', description: '성도 - 본인 게시글 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchCommunityPostWriteRequest,
  ) {
    const post = await this.updateUseCase.execute(signature.id, id, request.toCommand());
    return new OnchurchCommunityPostResponse(post);
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '성도 - 본인 게시글 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(signature.id, id);
    return new OkResponse();
  }

  // ── 관리자(교회 소유자) 사후 관리 ─────────────────────
  @RestApiGet(OnchurchCommunityPostManageListResponse, { path: '/manage', description: '관리자 - 교제 게시글 전체 목록(숨김 포함)', auth: [USER_TYPE.CLIENT] })
  async listManage(@AuthSignature() signature: UserSignature) {
    const posts = await this.listManageUseCase.execute(signature.id);
    return new OnchurchCommunityPostManageListResponse(posts);
  }

  @RestApiPut(OnchurchCommunityPostManageResponse, { path: '/manage/:id/hide', description: '관리자 - 게시글 숨김/노출 전환', auth: [USER_TYPE.CLIENT] })
  async setHidden(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchCommunityPostHideRequest,
  ) {
    const post = await this.setHiddenUseCase.execute(signature.id, id, !!request.isHidden);
    return new OnchurchCommunityPostManageResponse(post);
  }

  @RestApiDelete(OkResponse, { path: '/manage/:id', description: '관리자 - 게시글 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteManage(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteManageUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
