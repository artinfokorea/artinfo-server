import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { SalpyeoGetMeUseCase } from '@/salpyeo/user/application/usecase/salpyeo-get-me.usecase';
import { SalpyeoUserResponse } from '@/salpyeo/user/presentation/dto/response/salpyeo-user.response';

@RestApiController('/salpyeo/users', 'Salpyeo User')
export class SalpyeoUserController {
  constructor(private readonly getMeUseCase: SalpyeoGetMeUseCase) {}

  @RestApiGet(SalpyeoUserResponse, { path: '/me', description: '내 정보 조회', auth: [USER_TYPE.CLIENT] })
  async getMe(@AuthSignature() signature: UserSignature) {
    const user = await this.getMeUseCase.execute(signature.id);

    return new SalpyeoUserResponse(user);
  }
}
