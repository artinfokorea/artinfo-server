import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMySermonsUseCase,
  OnchurchCreateMySermonUseCase,
  OnchurchUpdateMySermonUseCase,
  OnchurchDeleteMySermonUseCase,
} from '@/onchurch/sermon/application/usecase/onchurch-sermon.usecase';
import { OnchurchSermonWriteRequest } from '@/onchurch/sermon/presentation/dto/request/onchurch-sermon-write.request';
import { OnchurchSermonListResponse, OnchurchSermonResponse } from '@/onchurch/sermon/presentation/dto/response/onchurch-sermon.response';

@RestApiController('/onchurch/sermons', 'Onchurch Sermon')
export class OnchurchSermonController {
  constructor(
    private readonly listUseCase: OnchurchListMySermonsUseCase,
    private readonly createUseCase: OnchurchCreateMySermonUseCase,
    private readonly updateUseCase: OnchurchUpdateMySermonUseCase,
    private readonly deleteUseCase: OnchurchDeleteMySermonUseCase,
  ) {}

  @RestApiGet(OnchurchSermonListResponse, { path: '/me', description: '내 교회 설교 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchSermonListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchSermonResponse, { path: '/me', description: '설교 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchSermonWriteRequest) {
    return new OnchurchSermonResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchSermonResponse, { path: '/me/:id', description: '설교 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchSermonWriteRequest) {
    return new OnchurchSermonResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '설교 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
