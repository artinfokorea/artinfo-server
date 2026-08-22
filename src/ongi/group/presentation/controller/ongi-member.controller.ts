import { Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OngiBlockMemberUseCase, OngiGetMemberUseCase } from '@/ongi/group/application/usecase/ongi-group.usecase';
import { OngiMemberResponse } from '@/ongi/group/presentation/dto/response/ongi-member.response';

@RestApiController('/ongi/members', 'Ongi Member')
export class OngiMemberController {
  constructor(
    private readonly getMemberUseCase: OngiGetMemberUseCase,
    private readonly blockMemberUseCase: OngiBlockMemberUseCase,
  ) {}

  @RestApiGet(OngiMemberResponse, { path: '/:memberId', description: '구성원 상세 조회', auth: [USER_TYPE.CLIENT] })
  async getMember(@AuthSignature() signature: UserSignature, @Param('memberId', ParseIntPipe) memberId: number) {
    const view = await this.getMemberUseCase.execute(signature.id, memberId);

    return new OngiMemberResponse(view);
  }

  @RestApiPost(OkResponse, {
    path: '/:memberId/block',
    description: '구성원 차단 — 차단한 사용자의 사진·댓글이 나에게 보이지 않는다',
    auth: [USER_TYPE.CLIENT],
  })
  async blockMember(@AuthSignature() signature: UserSignature, @Param('memberId', ParseIntPipe) memberId: number) {
    await this.blockMemberUseCase.execute(signature.id, memberId, true);

    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:memberId/block', description: '구성원 차단 해제', auth: [USER_TYPE.CLIENT] })
  async unblockMember(@AuthSignature() signature: UserSignature, @Param('memberId', ParseIntPipe) memberId: number) {
    await this.blockMemberUseCase.execute(signature.id, memberId, false);

    return new OkResponse();
  }
}
