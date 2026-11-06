import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { OkResponse } from '@/common/response/ok.response';
import { USER_TYPE } from '@/user/entity/user.entity';
import { ArtinfoModerationRepository } from '@/moderation/artinfo-moderation.repository';
import { BlockRequest, ReportRequest } from '@/moderation/dto/report.request';
import { BlockedUsersResponse } from '@/moderation/dto/blocked-users.response';
import { CannotBlockYourself } from '@/moderation/artinfo-moderation.exception';

/** 커뮤니티 신고·차단 (App Store 1.2 UGC) — 신고는 운영자가 검토, 차단 목록은 앱이 글·댓글을 숨기는 데 쓴다 */
@RestApiController('/moderation', 'Moderation')
export class ArtinfoModerationController {
  constructor(private readonly repository: ArtinfoModerationRepository) {}

  @RestApiPost(OkResponse, { path: '/reports', description: '글·댓글·회원 신고', auth: [USER_TYPE.CLIENT] })
  async report(@AuthSignature() signature: UserSignature, @Body() request: ReportRequest): Promise<OkResponse> {
    await this.repository.report({
      reporterUserId: signature.id,
      targetType: request.targetType,
      targetId: request.targetId,
      reason: request.reason,
    });
    return new OkResponse();
  }

  @RestApiPost(OkResponse, { path: '/blocks', description: '회원 차단', auth: [USER_TYPE.CLIENT] })
  async block(@AuthSignature() signature: UserSignature, @Body() request: BlockRequest): Promise<OkResponse> {
    if (request.userId === signature.id) throw new CannotBlockYourself();
    await this.repository.block(signature.id, request.userId);
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/blocks/:userId', description: '회원 차단 해제', auth: [USER_TYPE.CLIENT] })
  async unblock(@AuthSignature() signature: UserSignature, @Param('userId', ParseIntPipe) userId: number): Promise<OkResponse> {
    await this.repository.unblock(signature.id, userId);
    return new OkResponse();
  }

  @RestApiGet(BlockedUsersResponse, { path: '/blocks', description: '내가 차단한 회원 ID 목록', auth: [USER_TYPE.CLIENT] })
  async blockedUsers(@AuthSignature() signature: UserSignature): Promise<BlockedUsersResponse> {
    return new BlockedUsersResponse(await this.repository.blockedUserIds(signature.id));
  }
}
