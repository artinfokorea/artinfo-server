import { Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OngiGetMemberUseCase } from '@/ongi/group/application/usecase/ongi-group.usecase';
import { OngiMemberResponse } from '@/ongi/group/presentation/dto/response/ongi-member.response';

@RestApiController('/ongi/members', 'Ongi Member')
export class OngiMemberController {
  constructor(private readonly getMemberUseCase: OngiGetMemberUseCase) {}

  @RestApiGet(OngiMemberResponse, { path: '/:memberId', description: '구성원 상세 조회', auth: [USER_TYPE.CLIENT] })
  async getMember(@AuthSignature() signature: UserSignature, @Param('memberId', ParseIntPipe) memberId: number) {
    const view = await this.getMemberUseCase.execute(signature.id, memberId);

    return new OngiMemberResponse(view);
  }
}
