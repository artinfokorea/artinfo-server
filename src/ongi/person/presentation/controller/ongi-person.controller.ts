import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OngiCreatePersonUseCase, OngiScanPeopleUseCase } from '@/ongi/person/application/usecase/ongi-person.usecase';
import { OngiCreatePersonRequest } from '@/ongi/person/presentation/dto/request/ongi-create-person.request';
import { OngiPersonListResponse, OngiPersonResponse } from '@/ongi/person/presentation/dto/response/ongi-person.response';

@RestApiController('/ongi/groups', 'Ongi Person')
export class OngiPersonController {
  constructor(
    private readonly scanPeopleUseCase: OngiScanPeopleUseCase,
    private readonly createPersonUseCase: OngiCreatePersonUseCase,
  ) {}

  @RestApiGet(OngiPersonListResponse, { path: '/:groupId/people', description: '그룹의 인물 태그 목록', auth: [USER_TYPE.CLIENT] })
  async scanPeople(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number) {
    const views = await this.scanPeopleUseCase.execute(signature.id, groupId);

    return new OngiPersonListResponse(views);
  }

  @RestApiPost(OngiPersonResponse, { path: '/:groupId/people', description: '그룹에 인물 태그 추가', auth: [USER_TYPE.CLIENT] })
  async createPerson(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number, @Body() request: OngiCreatePersonRequest) {
    const view = await this.createPersonUseCase.execute(signature.id, groupId, request.name.trim(), request.imageUrl?.trim() || null);

    return new OngiPersonResponse(view);
  }
}
