import { Body } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import {
  OnchurchScanMyPastorUseCase,
  OnchurchUpsertMyPastorUseCase,
} from '@/onchurch/about/application/usecase/onchurch-pastor.usecase';
import { OnchurchPastorWriteRequest } from '@/onchurch/about/presentation/dto/request/onchurch-pastor-write.request';
import { OnchurchMyPastorResponse, OnchurchPastorResponse } from '@/onchurch/about/presentation/dto/response/onchurch-about.response';

@RestApiController('/onchurch/pastors', 'Onchurch Pastor')
export class OnchurchPastorController {
  constructor(
    private readonly scanUseCase: OnchurchScanMyPastorUseCase,
    private readonly upsertUseCase: OnchurchUpsertMyPastorUseCase,
  ) {}

  @RestApiGet(OnchurchMyPastorResponse, { path: '/me', description: '내 교회 담임목사 정보 조회', auth: [USER_TYPE.CLIENT] })
  async scanMine(@AuthSignature() signature: UserSignature) {
    const pastor = await this.scanUseCase.execute(signature.id);
    return new OnchurchMyPastorResponse(pastor);
  }

  @RestApiPut(OnchurchPastorResponse, { path: '/me', description: '내 교회 담임목사 정보 생성/수정', auth: [USER_TYPE.CLIENT] })
  async upsertMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchPastorWriteRequest) {
    const pastor = await this.upsertUseCase.execute(signature.id, request.toCommand());
    return new OnchurchPastorResponse(pastor);
  }
}
