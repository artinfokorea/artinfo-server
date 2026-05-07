import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyStaffsUseCase,
  OnchurchCreateMyStaffUseCase,
  OnchurchUpdateMyStaffUseCase,
  OnchurchDeleteMyStaffUseCase,
} from '@/onchurch/about/application/usecase/onchurch-staff.usecase';
import { OnchurchStaffWriteRequest } from '@/onchurch/about/presentation/dto/request/onchurch-staff-write.request';
import { OnchurchStaffListResponse, OnchurchStaffResponse } from '@/onchurch/about/presentation/dto/response/onchurch-about.response';

@RestApiController('/onchurch/staffs', 'Onchurch Staff')
export class OnchurchStaffController {
  constructor(
    private readonly listUseCase: OnchurchListMyStaffsUseCase,
    private readonly createUseCase: OnchurchCreateMyStaffUseCase,
    private readonly updateUseCase: OnchurchUpdateMyStaffUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyStaffUseCase,
  ) {}

  @RestApiGet(OnchurchStaffListResponse, { path: '/me', description: '내 교회 교역자 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchStaffListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchStaffResponse, { path: '/me', description: '교역자 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchStaffWriteRequest) {
    return new OnchurchStaffResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchStaffResponse, { path: '/me/:id', description: '교역자 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchStaffWriteRequest) {
    return new OnchurchStaffResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '교역자 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
