import { Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchListChurchMembersUseCase, OnchurchRemoveChurchMemberUseCase } from '@/onchurch/church/application/usecase/onchurch-church-member.usecase';
import { OnchurchChurchMemberListResponse } from '@/onchurch/church/presentation/dto/response/onchurch-church-member.response';

@RestApiController('/onchurch/church-members', 'Onchurch Church Members')
export class OnchurchChurchMemberController {
  constructor(
    private readonly listUseCase: OnchurchListChurchMembersUseCase,
    private readonly removeUseCase: OnchurchRemoveChurchMemberUseCase,
  ) {}

  @RestApiGet(OnchurchChurchMemberListResponse, { path: '/me', description: '내 교회 성도(회원) 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    const members = await this.listUseCase.execute(signature.id);
    return new OnchurchChurchMemberListResponse(members);
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '성도(회원) 삭제', auth: [USER_TYPE.CLIENT] })
  async removeMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.removeUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
