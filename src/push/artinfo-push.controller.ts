import { Body, Logger } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { OkResponse } from '@/common/response/ok.response';
import { USER_TYPE } from '@/user/entity/user.entity';
import { ArtinfoPushRepository, DEFAULT_PUSH_PREFERENCES } from '@/push/artinfo-push.repository';
import { RegisterPushTokenRequest, SendTestPushRequest, UnregisterPushTokenRequest, UpdatePushPreferencesRequest } from '@/push/dto/push.request';
import { PushSendResultResponse } from '@/push/dto/push-send-result.response';
import { ArtinfoPushService } from '@/push/artinfo-push.service';
import { PushPreferencesResponse } from '@/push/dto/push-preferences.response';

/** 아트인포 앱 푸시 — 기기 토큰 등록·해제, 종류별 수신 설정, 관리자 테스트 발송 */
@RestApiController('/push', 'Push')
export class ArtinfoPushController {
  private readonly logger = new Logger(ArtinfoPushController.name);

  constructor(
    private readonly repository: ArtinfoPushRepository,
    private readonly pushService: ArtinfoPushService,
  ) {}

  @RestApiPost(OkResponse, { path: '/tokens', description: '이 기기의 푸시 토큰 등록 (로그인 후)', auth: [USER_TYPE.CLIENT] })
  async register(@AuthSignature() signature: UserSignature, @Body() request: RegisterPushTokenRequest): Promise<OkResponse> {
    await this.repository.upsertToken(signature.id, request.token.trim(), request.platform ?? 'ios');
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/tokens', description: '이 기기의 푸시 토큰 해제 (로그아웃)', auth: [USER_TYPE.CLIENT] })
  async unregister(@AuthSignature() _signature: UserSignature, @Body() request: UnregisterPushTokenRequest): Promise<OkResponse> {
    await this.repository.deleteToken(request.token.trim());
    return new OkResponse();
  }

  @RestApiGet(PushPreferencesResponse, { path: '/preferences', description: '내 푸시 수신 설정 (저장 전엔 전부 켜짐)', auth: [USER_TYPE.CLIENT] })
  async getPreferences(@AuthSignature() signature: UserSignature): Promise<PushPreferencesResponse> {
    return new PushPreferencesResponse((await this.repository.findPreferences(signature.id)) ?? DEFAULT_PUSH_PREFERENCES);
  }

  @RestApiPut(PushPreferencesResponse, { path: '/preferences', description: '푸시 수신 설정 변경 — 보낸 항목만 바뀐다', auth: [USER_TYPE.CLIENT] })
  async updatePreferences(@AuthSignature() signature: UserSignature, @Body() request: UpdatePushPreferencesRequest): Promise<PushPreferencesResponse> {
    const current = (await this.repository.findPreferences(signature.id)) ?? DEFAULT_PUSH_PREFERENCES;
    const merged = { ...current, ...(typeof request.job === 'boolean' ? { job: request.job } : {}) };
    await this.repository.savePreferences(signature.id, merged);
    return new PushPreferencesResponse(merged);
  }

  @RestApiPost(PushSendResultResponse, {
    path: '/test',
    description: '[관리자] 테스트 푸시 발송 — target ADMIN(관리자 기기만) / ALL(전체)',
    auth: [USER_TYPE.ADMIN],
  })
  async sendTest(@AuthSignature() signature: UserSignature, @Body() request: SendTestPushRequest): Promise<PushSendResultResponse> {
    this.logger.log(`테스트 푸시(${request.target}) — 관리자 ${signature.id}`);
    const title = request.title?.trim() || '아트인포 테스트 푸시';
    const body = request.body?.trim() || '푸시 테스트 메시지입니다.';
    return new PushSendResultResponse(await this.pushService.sendTest(request.target, title, body));
  }

  @RestApiPost(PushSendResultResponse, {
    path: '/digest',
    description: '[관리자] 채용 요약 푸시를 지금 보낸다 (매일 12:00 KST 스케줄과 같은 내용, 새 공고 0건이면 보내지 않음)',
    auth: [USER_TYPE.ADMIN],
  })
  async sendDigestNow(@AuthSignature() signature: UserSignature): Promise<PushSendResultResponse> {
    this.logger.log(`채용 요약 푸시 수동 발송 — 관리자 ${signature.id}`);
    return new PushSendResultResponse(await this.pushService.sendJobDigest());
  }
}
