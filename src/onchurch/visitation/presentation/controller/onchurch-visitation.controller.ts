import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyVisitationsUseCase,
  OnchurchListMyVisitationsBySaintUseCase,
  OnchurchCreateMyVisitationUseCase,
  OnchurchUpdateMyVisitationUseCase,
  OnchurchDeleteMyVisitationUseCase,
} from '@/onchurch/visitation/application/usecase/onchurch-visitation.usecase';
import {
  OnchurchListMyVisitationTypesUseCase,
  OnchurchCreateMyVisitationTypeUseCase,
  OnchurchDeleteMyVisitationTypeUseCase,
} from '@/onchurch/visitation/application/usecase/onchurch-visitation-type.usecase';
import { OnchurchVisitationWriteRequest } from '@/onchurch/visitation/presentation/dto/request/onchurch-visitation-write.request';
import { OnchurchVisitationTypeCreateRequest } from '@/onchurch/visitation/presentation/dto/request/onchurch-visitation-type-create.request';
import {
  OnchurchVisitationListResponse,
  OnchurchVisitationResponse,
  OnchurchVisitationTypeListResponse,
  OnchurchVisitationTypeResponse,
} from '@/onchurch/visitation/presentation/dto/response/onchurch-visitation.response';

@RestApiController('/onchurch/visitations', 'Onchurch Visitation')
export class OnchurchVisitationController {
  constructor(
    private readonly listUseCase: OnchurchListMyVisitationsUseCase,
    private readonly listBySaintUseCase: OnchurchListMyVisitationsBySaintUseCase,
    private readonly createUseCase: OnchurchCreateMyVisitationUseCase,
    private readonly updateUseCase: OnchurchUpdateMyVisitationUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyVisitationUseCase,
    private readonly listTypesUseCase: OnchurchListMyVisitationTypesUseCase,
    private readonly createTypeUseCase: OnchurchCreateMyVisitationTypeUseCase,
    private readonly deleteTypeUseCase: OnchurchDeleteMyVisitationTypeUseCase,
  ) {}

  @RestApiGet(OnchurchVisitationTypeListResponse, { path: '/me/types', description: '심방 종류 목록', auth: [USER_TYPE.CLIENT] })
  async listTypes(@AuthSignature() s: UserSignature) {
    return new OnchurchVisitationTypeListResponse(await this.listTypesUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchVisitationTypeResponse, { path: '/me/types', description: '심방 종류 추가', auth: [USER_TYPE.CLIENT] })
  async createType(@AuthSignature() s: UserSignature, @Body() req: OnchurchVisitationTypeCreateRequest) {
    return new OnchurchVisitationTypeResponse(await this.createTypeUseCase.execute(s.id, req.name.trim()));
  }

  @RestApiDelete(OkResponse, { path: '/me/types/:id', description: '심방 종류 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteType(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteTypeUseCase.execute(s.id, id);
    return new OkResponse();
  }

  @RestApiGet(OnchurchVisitationListResponse, { path: '/me', description: '내 교회 심방 기록 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchVisitationListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiGet(OnchurchVisitationListResponse, { path: '/me/by-saint/:saintId', description: '특정 성도의 심방 기록 목록', auth: [USER_TYPE.CLIENT] })
  async listBySaint(@AuthSignature() s: UserSignature, @Param('saintId', ParseIntPipe) saintId: number) {
    return new OnchurchVisitationListResponse(await this.listBySaintUseCase.execute(s.id, saintId));
  }

  @RestApiPost(OnchurchVisitationResponse, { path: '/me', description: '심방 기록 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchVisitationWriteRequest) {
    return new OnchurchVisitationResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchVisitationResponse, { path: '/me/:id', description: '심방 기록 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchVisitationWriteRequest) {
    return new OnchurchVisitationResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '심방 기록 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
