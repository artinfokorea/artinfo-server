import { Body } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import {
  OnchurchScanMyBulletinUseCase,
  OnchurchUpsertMyBulletinUseCase,
} from '@/onchurch/bulletin/application/usecase/onchurch-bulletin.usecase';
import { OnchurchBulletinWriteRequest } from '@/onchurch/bulletin/presentation/dto/request/onchurch-bulletin-write.request';
import {
  OnchurchBulletinResponse,
  OnchurchMyBulletinResponse,
} from '@/onchurch/bulletin/presentation/dto/response/onchurch-bulletin.response';

@RestApiController('/onchurch/bulletins', 'Onchurch Bulletin')
export class OnchurchBulletinController {
  constructor(
    private readonly scanUseCase: OnchurchScanMyBulletinUseCase,
    private readonly upsertUseCase: OnchurchUpsertMyBulletinUseCase,
  ) {}

  @RestApiGet(OnchurchMyBulletinResponse, { path: '/me', description: '내 교회 주보 데이터 조회', auth: [USER_TYPE.CLIENT] })
  async scanMine(@AuthSignature() signature: UserSignature) {
    const bulletin = await this.scanUseCase.execute(signature.id);
    return new OnchurchMyBulletinResponse(bulletin);
  }

  @RestApiPut(OnchurchBulletinResponse, { path: '/me', description: '내 교회 주보 데이터 생성/수정', auth: [USER_TYPE.CLIENT] })
  async upsertMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchBulletinWriteRequest) {
    const bulletin = await this.upsertUseCase.execute(signature.id, request.toCommand());
    return new OnchurchBulletinResponse(bulletin);
  }
}
