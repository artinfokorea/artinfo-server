import { Body, Headers } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { Signature } from '@/common/decorator/Signature';
import { UserSignature } from '@/common/type/type';
import { OkResponse } from '@/common/response/ok.response';
import { ActivityPingRequest } from '@/activity/dto/activity-ping.request';
import { ArtinfoActivityRepository } from '@/activity/repository/artinfo-activity.repository';
import { isBotUserAgent, isValidVisitorId, normalizeActiveSeconds } from '@/activity/domain/artinfo-activity-policy';

/**
 * 웹 방문 하트비트 — 비회원도 보낸다. 로그인 상태(유효한 토큰)면 회원 ID 를 함께 남긴다.
 * 탭이 화면에 보이는 동안 1분마다, 그리고 탭을 떠날 때 보낸다.
 */
@RestApiController('/activity', 'Activity')
export class ArtinfoActivityController {
  constructor(private readonly activityRepository: ArtinfoActivityRepository) {}

  @RestApiPost(OkResponse, { path: '/ping', description: '방문 하트비트 (방문자 ID, 체류 초, 새 방문 여부)' })
  async ping(
    @Signature() signature: UserSignature | null,
    @Headers('user-agent') userAgent: string | undefined,
    @Body() request: ActivityPingRequest,
  ): Promise<OkResponse> {
    // 형식이 틀린 ID·로봇은 조용히 무시한다 (집계를 오염시키지 않되 클라이언트 오류로 만들지 않는다)
    if (!isValidVisitorId(request.visitorId) || isBotUserAgent(userAgent)) return new OkResponse();

    await this.activityRepository.addPing({
      visitorId: request.visitorId.toLowerCase(),
      userId: signature?.id ?? null,
      seconds: normalizeActiveSeconds(request.seconds),
      newSession: request.newSession === true,
    });
    return new OkResponse();
  }
}
