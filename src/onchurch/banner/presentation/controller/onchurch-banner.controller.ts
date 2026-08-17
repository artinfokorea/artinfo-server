import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchListMyBannersUseCase } from '@/onchurch/banner/application/usecase/onchurch-list-my-banners.usecase';
import { OnchurchCreateMyBannerUseCase } from '@/onchurch/banner/application/usecase/onchurch-create-my-banner.usecase';
import { OnchurchUpdateMyBannerUseCase } from '@/onchurch/banner/application/usecase/onchurch-update-my-banner.usecase';
import { OnchurchDeleteMyBannerUseCase } from '@/onchurch/banner/application/usecase/onchurch-delete-my-banner.usecase';
import { OnchurchUpdateMyBannerTypeUseCase } from '@/onchurch/banner/application/usecase/onchurch-update-my-banner-type.usecase';
import { OnchurchBannerWriteRequest } from '@/onchurch/banner/presentation/dto/request/onchurch-banner-write.request';
import { OnchurchBannerTypeRequest } from '@/onchurch/banner/presentation/dto/request/onchurch-banner-type.request';
import { OnchurchBannerListResponse, OnchurchBannerResponse } from '@/onchurch/banner/presentation/dto/response/onchurch-banner.response';

@RestApiController('/onchurch/banners', 'Onchurch Banner')
export class OnchurchBannerController {
  constructor(
    private readonly listUseCase: OnchurchListMyBannersUseCase,
    private readonly createUseCase: OnchurchCreateMyBannerUseCase,
    private readonly updateUseCase: OnchurchUpdateMyBannerUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyBannerUseCase,
    private readonly updateTypeUseCase: OnchurchUpdateMyBannerTypeUseCase,
  ) {}

  @RestApiGet(OnchurchBannerListResponse, { path: '/me', description: '내 교회의 배너 목록 조회 (관리자)', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    const result = await this.listUseCase.execute(signature.id);
    return new OnchurchBannerListResponse(result.bannerType, result.banners);
  }

  @RestApiPut(OkResponse, { path: '/me/type', description: '홈에 노출할 배너 타입 변경 (사진/영상)', auth: [USER_TYPE.CLIENT] })
  async updateMyBannerType(@AuthSignature() signature: UserSignature, @Body() request: OnchurchBannerTypeRequest) {
    await this.updateTypeUseCase.execute(signature.id, request.type);
    return new OkResponse();
  }

  @RestApiPost(OnchurchBannerResponse, { path: '/me', description: '내 교회 배너 생성', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchBannerWriteRequest) {
    const banner = await this.createUseCase.execute(signature.id, request.toCommand());
    return new OnchurchBannerResponse(banner);
  }

  @RestApiPut(OnchurchBannerResponse, { path: '/me/:id', description: '내 교회 배너 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchBannerWriteRequest,
  ) {
    const banner = await this.updateUseCase.execute(signature.id, id, request.toCommand());
    return new OnchurchBannerResponse(banner);
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '내 교회 배너 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
