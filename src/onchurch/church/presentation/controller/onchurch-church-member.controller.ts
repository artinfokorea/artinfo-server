import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchListChurchMembersUseCase, OnchurchRemoveChurchMemberUseCase, OnchurchChangeChurchMemberRoleUseCase } from '@/onchurch/church/application/usecase/onchurch-church-member.usecase';
import { OnchurchChurchMemberListResponse } from '@/onchurch/church/presentation/dto/response/onchurch-church-member.response';
import { OnchurchChangeMemberRoleRequest } from '@/onchurch/church/presentation/dto/request/onchurch-change-member-role.request';

@RestApiController('/onchurch/church-members', 'Onchurch Church Members')
export class OnchurchChurchMemberController {
  constructor(
    private readonly listUseCase: OnchurchListChurchMembersUseCase,
    private readonly removeUseCase: OnchurchRemoveChurchMemberUseCase,
    private readonly changeRoleUseCase: OnchurchChangeChurchMemberRoleUseCase,
  ) {}

  @RestApiGet(OnchurchChurchMemberListResponse, { path: '/me', description: '내 교회 성도(회원) 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    const { users, churchOwnerId } = await this.listUseCase.execute(signature.id);
    return new OnchurchChurchMemberListResponse(users, churchOwnerId);
  }

  @RestApiPut(OkResponse, { path: '/me/:id/role', description: '성도(회원) 등급 변경 (관리자↔맴버)', auth: [USER_TYPE.CLIENT] })
  async changeRole(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() body: OnchurchChangeMemberRoleRequest) {
    await this.changeRoleUseCase.execute(signature.id, id, body.role);
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '성도(회원) 삭제', auth: [USER_TYPE.CLIENT] })
  async removeMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.removeUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
