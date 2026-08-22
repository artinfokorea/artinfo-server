import { Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { UploadFile } from '@/common/type/type';
import { OngiUpdateMeRequest } from '@/ongi/user/presentation/dto/request/ongi-update-me.request';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OngiDeleteAccountUseCase,
  OngiGetMeUseCase,
  OngiGetMyStatsUseCase,
  OngiGetMyStorageUseCase,
  OngiUpdateMeUseCase,
  OngiUploadAvatarUseCase,
} from '@/ongi/user/application/usecase/ongi-user.usecase';
import { OngiProfileStatsResponse, OngiStorageResponse, OngiUserResponse } from '@/ongi/user/presentation/dto/response/ongi-user.response';

@RestApiController('/ongi/users', 'Ongi User')
export class OngiUserController {
  constructor(
    private readonly getMeUseCase: OngiGetMeUseCase,
    private readonly getMyStatsUseCase: OngiGetMyStatsUseCase,
    private readonly getMyStorageUseCase: OngiGetMyStorageUseCase,
    private readonly deleteAccountUseCase: OngiDeleteAccountUseCase,
    private readonly updateMeUseCase: OngiUpdateMeUseCase,
    private readonly uploadAvatarUseCase: OngiUploadAvatarUseCase,
  ) {}

  @RestApiGet(OngiUserResponse, { path: '/me', description: '내 정보 조회', auth: [USER_TYPE.CLIENT] })
  async getMe(@AuthSignature() signature: UserSignature) {
    const user = await this.getMeUseCase.execute(signature.id);

    return new OngiUserResponse(user);
  }

  @RestApiPut(OngiUserResponse, { path: '/me', description: '내 이름 변경 — 구성원·인물 표시 이름에도 전파', auth: [USER_TYPE.CLIENT] })
  async updateMe(@AuthSignature() signature: UserSignature, @Body() request: OngiUpdateMeRequest) {
    const user = await this.updateMeUseCase.execute(signature.id, request.name.trim());

    return new OngiUserResponse(user);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatarFile', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @RestApiPost(OngiUserResponse, { path: '/me/avatar', description: '프로필 이미지 업로드 (S3)', auth: [USER_TYPE.CLIENT] })
  async uploadAvatar(@AuthSignature() signature: UserSignature, @UploadedFile() file: UploadFile) {
    const user = await this.uploadAvatarUseCase.execute(signature.id, file);

    return new OngiUserResponse(user);
  }

  @RestApiGet(OngiProfileStatsResponse, { path: '/me/stats', description: '프로필 통계 조회', auth: [USER_TYPE.CLIENT] })
  async getMyStats(@AuthSignature() signature: UserSignature) {
    const stats = await this.getMyStatsUseCase.execute(signature.id);

    return new OngiProfileStatsResponse(stats);
  }

  @RestApiGet(OngiStorageResponse, { path: '/me/storage', description: '저장 공간 조회', auth: [USER_TYPE.CLIENT] })
  async getMyStorage(@AuthSignature() signature: UserSignature) {
    const info = await this.getMyStorageUseCase.execute(signature.id);

    return new OngiStorageResponse(info);
  }

  @RestApiDelete(OkResponse, { path: '/me', description: '회원 탈퇴 — 계정과 올린 사진·댓글 등 연관 데이터를 함께 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMe(@AuthSignature() signature: UserSignature) {
    await this.deleteAccountUseCase.execute(signature.id);

    return new OkResponse();
  }
}
