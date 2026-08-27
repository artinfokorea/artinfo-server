import { Body } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OngiRegisterPushTokenUseCase, OngiUnregisterPushTokenUseCase } from '@/ongi/push/application/usecase/ongi-push.usecase';
import { OngiRegisterPushTokenRequest, OngiUnregisterPushTokenRequest } from '@/ongi/push/presentation/dto/request/ongi-push-token.request';

@RestApiController('/ongi/push-tokens', 'Ongi Push')
export class OngiPushController {
  constructor(
    private readonly registerPushTokenUseCase: OngiRegisterPushTokenUseCase,
    private readonly unregisterPushTokenUseCase: OngiUnregisterPushTokenUseCase,
  ) {}

  @RestApiPost(OkResponse, { path: '/', description: '이 기기의 푸시 토큰 등록 (로그인 후)', auth: [USER_TYPE.CLIENT] })
  async register(@AuthSignature() signature: UserSignature, @Body() request: OngiRegisterPushTokenRequest) {
    await this.registerPushTokenUseCase.execute(signature.id, request.token.trim(), request.platform ?? 'ios');

    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/', description: '이 기기의 푸시 토큰 해제 (로그아웃)', auth: [USER_TYPE.CLIENT] })
  async unregister(@AuthSignature() _signature: UserSignature, @Body() request: OngiUnregisterPushTokenRequest) {
    await this.unregisterPushTokenUseCase.execute(request.token.trim());

    return new OkResponse();
  }
}
