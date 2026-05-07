import { Body } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OnchurchScanMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-scan-my-church.usecase';
import { OnchurchUpsertMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-upsert-my-church.usecase';
import { OnchurchUpsertMyChurchRequest } from '@/onchurch/church/presentation/dto/request/onchurch-upsert-my-church.request';
import { OnchurchChurchResponse, OnchurchMyChurchResponse } from '@/onchurch/church/presentation/dto/response/onchurch-church.response';

@RestApiController('/onchurch/churches', 'Onchurch Church')
export class OnchurchChurchController {
  constructor(
    private readonly scanMyChurchUseCase: OnchurchScanMyChurchUseCase,
    private readonly upsertMyChurchUseCase: OnchurchUpsertMyChurchUseCase,
  ) {}

  @RestApiGet(OnchurchMyChurchResponse, { path: '/me', description: '내 교회 정보 조회', auth: [USER_TYPE.CLIENT] })
  async scanMyChurch(@AuthSignature() signature: UserSignature) {
    const church = await this.scanMyChurchUseCase.execute(signature.id);
    return new OnchurchMyChurchResponse(church);
  }

  @RestApiPut(OnchurchChurchResponse, { path: '/me', description: '내 교회 정보 생성/수정', auth: [USER_TYPE.CLIENT] })
  async upsertMyChurch(@AuthSignature() signature: UserSignature, @Body() request: OnchurchUpsertMyChurchRequest) {
    const church = await this.upsertMyChurchUseCase.execute(signature.id, request.toCommand());
    return new OnchurchChurchResponse(church);
  }
}
