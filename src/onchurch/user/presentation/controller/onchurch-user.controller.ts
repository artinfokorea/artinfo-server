import { Body } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchGetMyProfileUseCase, OnchurchUpdateMyProfileUseCase, OnchurchChangeMyPasswordUseCase, OnchurchSetInitialPasswordUseCase } from '@/onchurch/user/application/usecase/onchurch-user-profile.usecase';
import { OnchurchUpdateProfileRequest } from '@/onchurch/user/presentation/dto/request/onchurch-update-profile.request';
import { OnchurchChangePasswordRequest } from '@/onchurch/user/presentation/dto/request/onchurch-change-password.request';
import { OnchurchSetInitialPasswordRequest } from '@/onchurch/user/presentation/dto/request/onchurch-set-initial-password.request';
import { OnchurchUserProfileResponse } from '@/onchurch/user/presentation/dto/response/onchurch-user-profile.response';

@RestApiController('/onchurch/users', 'Onchurch User')
export class OnchurchUserController {
  constructor(
    private readonly getProfileUseCase: OnchurchGetMyProfileUseCase,
    private readonly updateProfileUseCase: OnchurchUpdateMyProfileUseCase,
    private readonly changePasswordUseCase: OnchurchChangeMyPasswordUseCase,
    private readonly setInitialPasswordUseCase: OnchurchSetInitialPasswordUseCase,
  ) {}

  @RestApiGet(OnchurchUserProfileResponse, { path: '/me', description: '내 회원정보 조회', auth: [USER_TYPE.CLIENT] })
  async getMine(@AuthSignature() signature: UserSignature) {
    const user = await this.getProfileUseCase.execute(signature.id);
    return new OnchurchUserProfileResponse(user);
  }

  @RestApiPut(OnchurchUserProfileResponse, { path: '/me', description: '내 회원정보 수정 (이름·연락처)', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchUpdateProfileRequest) {
    const user = await this.updateProfileUseCase.execute(signature.id, { name: request.name.trim(), phone: request.phone.trim() });
    return new OnchurchUserProfileResponse(user);
  }

  @RestApiPut(OkResponse, { path: '/me/password', description: '비밀번호 변경', auth: [USER_TYPE.CLIENT] })
  async changePassword(@AuthSignature() signature: UserSignature, @Body() request: OnchurchChangePasswordRequest) {
    await this.changePasswordUseCase.execute(signature.id, { currentPassword: request.currentPassword, newPassword: request.newPassword });
    return new OkResponse();
  }

  @RestApiPut(OkResponse, { path: '/me/initial-password', description: '임시비밀번호 계정 최초 비밀번호 설정 (현재 비밀번호 불필요)', auth: [USER_TYPE.CLIENT] })
  async setInitialPassword(@AuthSignature() signature: UserSignature, @Body() request: OnchurchSetInitialPasswordRequest) {
    await this.setInitialPasswordUseCase.execute(signature.id, { newPassword: request.newPassword });
    return new OkResponse();
  }
}
