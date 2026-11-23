import { Body } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { OkResponse } from '@/common/response/ok.response';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OnchurchPushRepository } from '@/onchurch/push/onchurch-push.repository';
import {
  OnchurchPushPreferencesResponse,
  OnchurchRegisterPushTokenRequest,
  OnchurchUnregisterPushTokenRequest,
  OnchurchUpdatePushPreferencesRequest,
} from '@/onchurch/push/onchurch-push.dto';

/** 온교회 앱 푸시 — 기기 토큰 등록·해제, 알림 받기 켜기/끄기 */
@RestApiController('/onchurch/push', 'Onchurch Push')
export class OnchurchPushController {
  constructor(private readonly repository: OnchurchPushRepository) {}

  @RestApiPost(OkResponse, { path: '/tokens', description: '이 기기의 푸시 토큰 등록 (로그인 후)', auth: [USER_TYPE.CLIENT] })
  async register(@AuthSignature() signature: UserSignature, @Body() request: OnchurchRegisterPushTokenRequest): Promise<OkResponse> {
    await this.repository.upsertToken(signature.id, request.token.trim(), request.platform ?? 'ios');
    return new OkResponse();
  }

  // 로그아웃 시 웹이 먼저 토큰을 지우는 경우가 있어 인증 없이 토큰으로만 해제한다 (토큰을 아는 기기만 지울 수 있다)
  @RestApiDelete(OkResponse, { path: '/tokens', description: '이 기기의 푸시 토큰 해제 (로그아웃)' })
  async unregister(@Body() request: OnchurchUnregisterPushTokenRequest): Promise<OkResponse> {
    await this.repository.deleteToken(request.token.trim());
    return new OkResponse();
  }

  @RestApiGet(OnchurchPushPreferencesResponse, { path: '/preferences', description: '내 앱 알림 받기 설정 (저장 전엔 켜짐)', auth: [USER_TYPE.CLIENT] })
  async getPreferences(@AuthSignature() signature: UserSignature): Promise<OnchurchPushPreferencesResponse> {
    return new OnchurchPushPreferencesResponse(await this.repository.isEnabled(signature.id));
  }

  @RestApiPut(OnchurchPushPreferencesResponse, { path: '/preferences', description: '앱 알림 받기 켜기/끄기', auth: [USER_TYPE.CLIENT] })
  async updatePreferences(
    @AuthSignature() signature: UserSignature,
    @Body() request: OnchurchUpdatePushPreferencesRequest,
  ): Promise<OnchurchPushPreferencesResponse> {
    await this.repository.setEnabled(signature.id, request.enabled);
    return new OnchurchPushPreferencesResponse(request.enabled);
  }
}
