import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyPrayersUseCase,
  OnchurchUpdateMyPrayerStatusUseCase,
  OnchurchDeleteMyPrayerUseCase,
} from '@/onchurch/prayer/application/usecase/onchurch-prayer-admin.usecase';
import { OnchurchPrayerStatusRequest } from '@/onchurch/prayer/presentation/dto/request/onchurch-prayer-status.request';
import { OnchurchPrayerAdminResponse, OnchurchPrayerListResponse } from '@/onchurch/prayer/presentation/dto/response/onchurch-prayer.response';

@RestApiController('/onchurch/prayers', 'Onchurch Prayer')
export class OnchurchPrayerController {
  constructor(
    private readonly listUseCase: OnchurchListMyPrayersUseCase,
    private readonly updateStatusUseCase: OnchurchUpdateMyPrayerStatusUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyPrayerUseCase,
  ) {}

  @RestApiGet(OnchurchPrayerListResponse, { path: '/me', description: '내 교회의 기도 요청 목록 (어드민)', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    const items = await this.listUseCase.execute(signature.id);
    return new OnchurchPrayerListResponse(items);
  }

  @RestApiPut(OnchurchPrayerAdminResponse, { path: '/me/:id/status', description: '기도 요청 상태 변경', auth: [USER_TYPE.CLIENT] })
  async updateStatus(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchPrayerStatusRequest,
  ) {
    const item = await this.updateStatusUseCase.execute(signature.id, id, request.status);
    return new OnchurchPrayerAdminResponse(item);
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '기도 요청 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
