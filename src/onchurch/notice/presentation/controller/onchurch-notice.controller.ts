import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchListMyNoticesUseCase } from '@/onchurch/notice/application/usecase/onchurch-list-my-notices.usecase';
import { OnchurchCreateMyNoticeUseCase } from '@/onchurch/notice/application/usecase/onchurch-create-my-notice.usecase';
import { OnchurchUpdateMyNoticeUseCase } from '@/onchurch/notice/application/usecase/onchurch-update-my-notice.usecase';
import { OnchurchDeleteMyNoticeUseCase } from '@/onchurch/notice/application/usecase/onchurch-delete-my-notice.usecase';
import { OnchurchNoticeWriteRequest } from '@/onchurch/notice/presentation/dto/request/onchurch-notice-write.request';
import { OnchurchNoticeListResponse, OnchurchNoticeResponse } from '@/onchurch/notice/presentation/dto/response/onchurch-notice.response';

@RestApiController('/onchurch/notices', 'Onchurch Notice')
export class OnchurchNoticeController {
  constructor(
    private readonly listUseCase: OnchurchListMyNoticesUseCase,
    private readonly createUseCase: OnchurchCreateMyNoticeUseCase,
    private readonly updateUseCase: OnchurchUpdateMyNoticeUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyNoticeUseCase,
  ) {}

  @RestApiGet(OnchurchNoticeListResponse, { path: '/me', description: '내 교회의 공지 목록 (어드민)', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    const notices = await this.listUseCase.execute(signature.id);
    return new OnchurchNoticeListResponse(notices);
  }

  @RestApiPost(OnchurchNoticeResponse, { path: '/me', description: '내 교회 공지 생성', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchNoticeWriteRequest) {
    const notice = await this.createUseCase.execute(signature.id, request.toCommand());
    return new OnchurchNoticeResponse(notice);
  }

  @RestApiPut(OnchurchNoticeResponse, { path: '/me/:id', description: '내 교회 공지 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchNoticeWriteRequest,
  ) {
    const notice = await this.updateUseCase.execute(signature.id, id, request.toCommand());
    return new OnchurchNoticeResponse(notice);
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '내 교회 공지 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
