import { Body } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OngiGetPushPreferencesUseCase, OngiUpdatePushPreferencesUseCase } from '@/ongi/push/application/usecase/ongi-push.usecase';
import { OngiUpdatePushPreferencesRequest } from '@/ongi/push/presentation/dto/request/ongi-push-preference.request';
import { OngiPushPreferencesResponse } from '@/ongi/push/presentation/dto/response/ongi-push-preference.response';

@RestApiController('/ongi/push-preferences', 'Ongi Push')
export class OngiPushPreferenceController {
  constructor(
    private readonly getPushPreferencesUseCase: OngiGetPushPreferencesUseCase,
    private readonly updatePushPreferencesUseCase: OngiUpdatePushPreferencesUseCase,
  ) {}

  @RestApiGet(OngiPushPreferencesResponse, { path: '/', description: '내 푸시 종류별 수신 설정 (저장 전엔 전부 켜짐)', auth: [USER_TYPE.CLIENT] })
  async get(@AuthSignature() signature: UserSignature) {
    return new OngiPushPreferencesResponse(await this.getPushPreferencesUseCase.execute(signature.id));
  }

  @RestApiPut(OngiPushPreferencesResponse, { path: '/', description: '푸시 종류별 수신 설정 변경 — 보낸 항목만 바뀐다', auth: [USER_TYPE.CLIENT] })
  async update(@AuthSignature() signature: UserSignature, @Body() request: OngiUpdatePushPreferencesRequest) {
    return new OngiPushPreferencesResponse(await this.updatePushPreferencesUseCase.execute(signature.id, request));
  }
}
