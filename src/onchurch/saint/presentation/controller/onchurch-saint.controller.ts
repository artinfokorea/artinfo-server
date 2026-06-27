import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMySaintsUseCase,
  OnchurchCreateMySaintUseCase,
  OnchurchUpdateMySaintUseCase,
  OnchurchUpdateMySaintMemoUseCase,
  OnchurchDeleteMySaintUseCase,
} from '@/onchurch/saint/application/usecase/onchurch-saint.usecase';
import {
  OnchurchListMySaintRelationsUseCase,
  OnchurchCreateMySaintRelationUseCase,
  OnchurchDeleteMySaintRelationUseCase,
} from '@/onchurch/saint/application/usecase/onchurch-saint-relation.usecase';
import {
  OnchurchListMySaintPrayersUseCase,
  OnchurchCreateMySaintPrayerUseCase,
  OnchurchDeleteMySaintPrayerUseCase,
} from '@/onchurch/saint/application/usecase/onchurch-saint-prayer.usecase';
import { OnchurchSaintWriteRequest } from '@/onchurch/saint/presentation/dto/request/onchurch-saint-write.request';
import { OnchurchSaintRelationCreateRequest } from '@/onchurch/saint/presentation/dto/request/onchurch-saint-relation-create.request';
import { OnchurchSaintPrayerCreateRequest } from '@/onchurch/saint/presentation/dto/request/onchurch-saint-prayer-create.request';
import { OnchurchSaintMemoUpdateRequest } from '@/onchurch/saint/presentation/dto/request/onchurch-saint-memo-update.request';
import {
  OnchurchSaintListResponse,
  OnchurchSaintRelationListResponse,
  OnchurchSaintResponse,
  OnchurchSaintPrayerListResponse,
} from '@/onchurch/saint/presentation/dto/response/onchurch-saint.response';

@RestApiController('/onchurch/saints', 'Onchurch Saint')
export class OnchurchSaintController {
  constructor(
    private readonly listUseCase: OnchurchListMySaintsUseCase,
    private readonly createUseCase: OnchurchCreateMySaintUseCase,
    private readonly updateUseCase: OnchurchUpdateMySaintUseCase,
    private readonly deleteUseCase: OnchurchDeleteMySaintUseCase,
    private readonly listRelationsUseCase: OnchurchListMySaintRelationsUseCase,
    private readonly createRelationUseCase: OnchurchCreateMySaintRelationUseCase,
    private readonly deleteRelationUseCase: OnchurchDeleteMySaintRelationUseCase,
    private readonly updateMemoUseCase: OnchurchUpdateMySaintMemoUseCase,
    private readonly listPrayersUseCase: OnchurchListMySaintPrayersUseCase,
    private readonly createPrayerUseCase: OnchurchCreateMySaintPrayerUseCase,
    private readonly deletePrayerUseCase: OnchurchDeleteMySaintPrayerUseCase,
  ) {}

  @RestApiGet(OnchurchSaintListResponse, { path: '/me', description: '내 교회 성도 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchSaintListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchSaintResponse, { path: '/me', description: '성도 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchSaintWriteRequest) {
    return new OnchurchSaintResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchSaintResponse, { path: '/me/:id', description: '성도 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchSaintWriteRequest) {
    return new OnchurchSaintResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '성도 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }

  @RestApiGet(OnchurchSaintRelationListResponse, { path: '/me/:id/relations', description: '성도 가족관계 목록', auth: [USER_TYPE.CLIENT] })
  async listRelations(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    return new OnchurchSaintRelationListResponse(await this.listRelationsUseCase.execute(s.id, id));
  }

  @RestApiPost(OkResponse, { path: '/me/:id/relations', description: '성도 가족관계 추가', auth: [USER_TYPE.CLIENT] })
  async createRelation(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchSaintRelationCreateRequest) {
    await this.createRelationUseCase.execute(s.id, id, req.toCommand());
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/me/relations/:relationId', description: '성도 가족관계 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteRelation(@AuthSignature() s: UserSignature, @Param('relationId', ParseIntPipe) relationId: number) {
    await this.deleteRelationUseCase.execute(s.id, relationId);
    return new OkResponse();
  }

  @RestApiPut(OnchurchSaintResponse, { path: '/me/:id/memo', description: '성도 메모 저장', auth: [USER_TYPE.CLIENT] })
  async updateMemo(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchSaintMemoUpdateRequest) {
    const memo = (req.memo ?? '').trim() || null;
    return new OnchurchSaintResponse(await this.updateMemoUseCase.execute(s.id, id, memo));
  }

  @RestApiGet(OnchurchSaintPrayerListResponse, { path: '/me/:id/prayers', description: '성도 기도목록', auth: [USER_TYPE.CLIENT] })
  async listPrayers(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    return new OnchurchSaintPrayerListResponse(await this.listPrayersUseCase.execute(s.id, id));
  }

  @RestApiPost(OkResponse, { path: '/me/:id/prayers', description: '성도 기도 추가', auth: [USER_TYPE.CLIENT] })
  async createPrayer(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchSaintPrayerCreateRequest) {
    await this.createPrayerUseCase.execute(s.id, id, req.content.trim());
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/me/prayers/:prayerId', description: '성도 기도 삭제', auth: [USER_TYPE.CLIENT] })
  async deletePrayer(@AuthSignature() s: UserSignature, @Param('prayerId', ParseIntPipe) prayerId: number) {
    await this.deletePrayerUseCase.execute(s.id, prayerId);
    return new OkResponse();
  }
}
