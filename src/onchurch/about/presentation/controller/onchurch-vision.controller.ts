import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyVisionsUseCase,
  OnchurchCreateMyVisionUseCase,
  OnchurchUpdateMyVisionUseCase,
  OnchurchDeleteMyVisionUseCase,
} from '@/onchurch/about/application/usecase/onchurch-vision.usecase';
import { OnchurchVisionWriteRequest } from '@/onchurch/about/presentation/dto/request/onchurch-vision-write.request';
import { OnchurchVisionListResponse, OnchurchVisionResponse } from '@/onchurch/about/presentation/dto/response/onchurch-about.response';

@RestApiController('/onchurch/visions', 'Onchurch Vision')
export class OnchurchVisionController {
  constructor(
    private readonly listUseCase: OnchurchListMyVisionsUseCase,
    private readonly createUseCase: OnchurchCreateMyVisionUseCase,
    private readonly updateUseCase: OnchurchUpdateMyVisionUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyVisionUseCase,
  ) {}

  @RestApiGet(OnchurchVisionListResponse, { path: '/me', description: '내 교회 비전 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchVisionListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchVisionResponse, { path: '/me', description: '비전 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchVisionWriteRequest) {
    return new OnchurchVisionResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchVisionResponse, { path: '/me/:id', description: '비전 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchVisionWriteRequest) {
    return new OnchurchVisionResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '비전 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
