import { Body } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OngiRecordActivityPingUseCase } from '@/ongi/activity/application/usecase/ongi-activity.usecase';
import { OngiActivityPingRequest } from '@/ongi/activity/presentation/dto/request/ongi-activity-ping.request';
import { OngiActivityOkResponse } from '@/ongi/activity/presentation/dto/response/ongi-activity.response';

@RestApiController('/ongi/activity', 'Ongi Activity')
export class OngiActivityController {
  constructor(private readonly recordPingUseCase: OngiRecordActivityPingUseCase) {}

  @RestApiPost(OngiActivityOkResponse, {
    path: '/ping',
    description: '앱 사용 시간 기록 — 앱을 켰을 때, 쓰는 동안 1분마다, 화면에서 내릴 때 보낸다 (관리자 지표용)',
    auth: [USER_TYPE.CLIENT],
  })
  async ping(@AuthSignature() signature: UserSignature, @Body() request: OngiActivityPingRequest) {
    await this.recordPingUseCase.execute(signature.id, request);

    return new OngiActivityOkResponse();
  }
}
