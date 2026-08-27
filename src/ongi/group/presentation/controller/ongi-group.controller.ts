import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import {
  OngiCreateGroupUseCase,
  OngiGetGroupUseCase,
  OngiJoinGroupUseCase,
  OngiLeaveGroupUseCase,
  OngiRemoveMemberUseCase,
  OngiScanMembersUseCase,
  OngiScanMyGroupsUseCase,
} from '@/ongi/group/application/usecase/ongi-group.usecase';
import { OngiCreateGroupRequest } from '@/ongi/group/presentation/dto/request/ongi-create-group.request';
import { OngiJoinGroupRequest } from '@/ongi/group/presentation/dto/request/ongi-join-group.request';
import { OngiGroupListResponse, OngiGroupResponse } from '@/ongi/group/presentation/dto/response/ongi-group.response';
import { OngiMemberListResponse } from '@/ongi/group/presentation/dto/response/ongi-member.response';

@RestApiController('/ongi/groups', 'Ongi Group')
export class OngiGroupController {
  constructor(
    private readonly scanMyGroupsUseCase: OngiScanMyGroupsUseCase,
    private readonly getGroupUseCase: OngiGetGroupUseCase,
    private readonly createGroupUseCase: OngiCreateGroupUseCase,
    private readonly joinGroupUseCase: OngiJoinGroupUseCase,
    private readonly scanMembersUseCase: OngiScanMembersUseCase,
    private readonly removeMemberUseCase: OngiRemoveMemberUseCase,
    private readonly leaveGroupUseCase: OngiLeaveGroupUseCase,
  ) {}

  @RestApiGet(OngiGroupListResponse, { path: '/', description: '내가 속한 가족 공간 목록', auth: [USER_TYPE.CLIENT] })
  async scanMyGroups(@AuthSignature() signature: UserSignature) {
    const summaries = await this.scanMyGroupsUseCase.execute(signature.id);

    return new OngiGroupListResponse(summaries);
  }

  @RestApiPost(OngiGroupResponse, { path: '/', description: '가족 공간 만들기 (만든 사람이 관리자)', auth: [USER_TYPE.CLIENT] })
  async createGroup(@AuthSignature() signature: UserSignature, @Body() request: OngiCreateGroupRequest) {
    const summary = await this.createGroupUseCase.execute(signature.id, signature.name, request.name.trim());

    return new OngiGroupResponse(summary);
  }

  @RestApiPost(OngiGroupResponse, { path: '/join', description: '초대 코드로 가족 공간 참여', auth: [USER_TYPE.CLIENT] })
  async joinGroup(@AuthSignature() signature: UserSignature, @Body() request: OngiJoinGroupRequest) {
    const summary = await this.joinGroupUseCase.execute(signature.id, signature.name, request.inviteCode);

    return new OngiGroupResponse(summary);
  }

  @RestApiGet(OngiGroupResponse, { path: '/:groupId', description: '가족 공간 상세 조회', auth: [USER_TYPE.CLIENT] })
  async getGroup(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number) {
    const summary = await this.getGroupUseCase.execute(signature.id, groupId);

    return new OngiGroupResponse(summary);
  }

  @RestApiGet(OngiMemberListResponse, { path: '/:groupId/members', description: '가족 공간 구성원 목록', auth: [USER_TYPE.CLIENT] })
  async scanMembers(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number) {
    const views = await this.scanMembersUseCase.execute(signature.id, groupId);

    return new OngiMemberListResponse(views);
  }

  @RestApiPost(OkResponse, {
    path: '/:groupId/leave',
    description: '가족 공간 나가기 — 유일한 관리자면 가장 먼저 참여한 구성원에게 위임, 마지막 구성원이면 공간 정리',
    auth: [USER_TYPE.CLIENT],
  })
  async leaveGroup(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number) {
    await this.leaveGroupUseCase.execute(signature.id, groupId);

    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:groupId/members/:memberId', description: '구성원 내보내기 (관리자 전용)', auth: [USER_TYPE.CLIENT] })
  async removeMember(
    @AuthSignature() signature: UserSignature,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    await this.removeMemberUseCase.execute(signature.id, groupId, memberId);

    return new OkResponse();
  }
}
