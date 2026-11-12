import { Body, Headers } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { Signature } from '@/common/decorator/Signature';
import { UserSignature } from '@/common/type/type';
import { OkResponse } from '@/common/response/ok.response';
import { ActivityPingRequest } from '@/activity/dto/activity-ping.request';
import { ArtinfoActivityRepository } from '@/activity/repository/artinfo-activity.repository';
import { isBotUserAgent, isValidVisitorId, normalizeActiveSeconds, normalizePageViews, normalizePaths } from '@/activity/domain/artinfo-activity-policy';
import { normalizeLandingPath, normalizeReferrerHost } from '@/activity/domain/user-agent';
import { clientIp } from '@/activity/domain/artinfo-activity-policy';
import { ArtinfoNewVisitorLimiter } from '@/activity/domain/artinfo-new-visitor-limiter';

/**
 * 웹 방문 하트비트 — 비회원도 보낸다. 로그인 상태(유효한 토큰)면 회원 ID 를 함께 남긴다.
 * 탭이 화면에 보이는 동안 1분마다, 그리고 탭을 떠날 때 보낸다.
 */
@RestApiController('/activity', 'Activity')
export class ArtinfoActivityController {
  constructor(
    private readonly activityRepository: ArtinfoActivityRepository,
    private readonly newVisitorLimiter: ArtinfoNewVisitorLimiter,
  ) {}

  @RestApiPost(OkResponse, { path: '/ping', description: '방문 하트비트 (방문자 ID, 체류 초, 새 방문 여부)' })
  async ping(
    @Signature() signature: UserSignature | null,
    @Headers('user-agent') userAgent: string | undefined,
    @Headers('x-forwarded-for') forwardedFor: string | undefined,
    @Body() request: ActivityPingRequest,
  ): Promise<OkResponse> {
    // 형식이 틀린 ID·로봇은 조용히 무시한다 (집계를 오염시키지 않되 클라이언트 오류로 만들지 않는다)
    if (!isValidVisitorId(request.visitorId) || isBotUserAgent(userAgent)) return new OkResponse();
    const visitorId = request.visitorId.toLowerCase();
    // 같은 IP 에서 한 시간에 새 방문자가 너무 많이 생기면(매번 새 프로필로 도는 크롤러) 그 뒤는 무시한다
    if (!(await this.newVisitorLimiter.allow(clientIp(forwardedFor), visitorId))) return new OkResponse();
    // IP 를 바꿔 가며 돌아도 UA 문자열은 하나다 — 같은 UA 로 10분에 새 방문자가 너무 많으면 그 뒤는 무시한다
    if (!(await this.newVisitorLimiter.allowByUserAgent(userAgent, visitorId))) return new OkResponse();

    await this.activityRepository.addPing({
      visitorId,
      userId: signature?.id ?? null,
      seconds: normalizeActiveSeconds(request.seconds),
      pageViews: normalizePageViews(request.pageViews),
      userAgent: userAgent ? userAgent.slice(0, 300) : null,
      referrerHost: normalizeReferrerHost(request.referrer),
      landingPath: normalizeLandingPath(request.path),
      // currentPath 를 보내지 않는 구버전 웹은 첫 페이지를 마지막 페이지로도 본다
      exitPath: normalizeLandingPath(request.currentPath ?? request.path),
      paths: normalizePaths(request.paths),
      newSession: request.newSession === true,
    });
    return new OkResponse();
  }
}
