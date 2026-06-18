import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMySermonSeriesUseCase,
  OnchurchCreateMySermonSeriesUseCase,
  OnchurchUpdateMySermonSeriesUseCase,
  OnchurchDeleteMySermonSeriesUseCase,
  OnchurchRestoreMySermonAllSeriesUseCase,
} from '@/onchurch/sermon/application/usecase/onchurch-sermon-series.usecase';
import { OnchurchSermonSeriesWriteRequest } from '@/onchurch/sermon/presentation/dto/request/onchurch-sermon-series-write.request';
import { OnchurchSermonSeriesListResponse, OnchurchSermonSeriesResponse } from '@/onchurch/sermon/presentation/dto/response/onchurch-sermon.response';

@RestApiController('/onchurch/sermon-series', 'Onchurch Sermon Series')
export class OnchurchSermonSeriesController {
  constructor(
    private readonly listUseCase: OnchurchListMySermonSeriesUseCase,
    private readonly createUseCase: OnchurchCreateMySermonSeriesUseCase,
    private readonly updateUseCase: OnchurchUpdateMySermonSeriesUseCase,
    private readonly deleteUseCase: OnchurchDeleteMySermonSeriesUseCase,
    private readonly restoreAllUseCase: OnchurchRestoreMySermonAllSeriesUseCase,
  ) {}

  @RestApiGet(OnchurchSermonSeriesListResponse, { path: '/me', description: '내 교회 설교 카테고리 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchSermonSeriesListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchSermonSeriesResponse, { path: '/me', description: '카테고리 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchSermonSeriesWriteRequest) {
    return new OnchurchSermonSeriesResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPost(OnchurchSermonSeriesListResponse, { path: '/me/all', description: "'전체' 보기 카테고리 복구/생성", auth: [USER_TYPE.CLIENT] })
  async restoreAllMine(@AuthSignature() s: UserSignature) {
    return new OnchurchSermonSeriesListResponse(await this.restoreAllUseCase.execute(s.id));
  }

  @RestApiPut(OnchurchSermonSeriesResponse, { path: '/me/:id', description: '카테고리 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchSermonSeriesWriteRequest) {
    return new OnchurchSermonSeriesResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '카테고리 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
