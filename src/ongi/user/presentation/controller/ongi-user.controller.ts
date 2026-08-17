import { RestApiController, RestApiDelete, RestApiGet } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OngiDeleteAccountUseCase, OngiGetMeUseCase, OngiGetMyStatsUseCase, OngiGetMyStorageUseCase } from '@/ongi/user/application/usecase/ongi-user.usecase';
import { OngiProfileStatsResponse, OngiStorageResponse, OngiUserResponse } from '@/ongi/user/presentation/dto/response/ongi-user.response';

@RestApiController('/ongi/users', 'Ongi User')
export class OngiUserController {
  constructor(
    private readonly getMeUseCase: OngiGetMeUseCase,
    private readonly getMyStatsUseCase: OngiGetMyStatsUseCase,
    private readonly getMyStorageUseCase: OngiGetMyStorageUseCase,
    private readonly deleteAccountUseCase: OngiDeleteAccountUseCase,
  ) {}

  @RestApiGet(OngiUserResponse, { path: '/me', description: '내 정보 조회', auth: [USER_TYPE.CLIENT] })
  async getMe(@AuthSignature() signature: UserSignature) {
    const user = await this.getMeUseCase.execute(signature.id);

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

  @RestApiDelete(OkResponse, { path: '/me', description: '회원 탈퇴', auth: [USER_TYPE.CLIENT] })
  async deleteMe(@AuthSignature() signature: UserSignature) {
    await this.deleteAccountUseCase.execute(signature.id);

    return new OkResponse();
  }
}
