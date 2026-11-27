import { Body } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { Holy365Auth, Holy365Signature, Holy365User } from '@/holy365/common/holy365-auth.guard';
import { Holy365UserUseCase } from '@/holy365/user/application/holy365-user.usecase';
import { Holy365SocialService } from '@/holy365/social/holy365-social.service';
import { Holy365UpdateMeRequest, Holy365UserResponse } from '@/holy365/user/presentation/dto/holy365-user.dto';

@RestApiController('/holy365/users', 'Holy365 User')
export class Holy365UserController {
  constructor(
    private readonly userUseCase: Holy365UserUseCase,
    private readonly socialService: Holy365SocialService,
  ) {}

  @Holy365Auth()
  @RestApiGet(Holy365UserResponse, { path: '/me', description: '내 정보' })
  async me(@Holy365User() signature: Holy365Signature) {
    const user = await this.userUseCase.me(signature.id);
    return new Holy365UserResponse(user, await this.socialService.churchOf(user.churchId));
  }

  @Holy365Auth()
  @RestApiPut(Holy365UserResponse, { path: '/me', description: '이름 · 서비스 언어 변경' })
  async update(@Holy365User() signature: Holy365Signature, @Body() request: Holy365UpdateMeRequest) {
    const user = await this.userUseCase.update(signature.id, request, async id => !!(await this.socialService.churchOf(id)));
    return new Holy365UserResponse(user, await this.socialService.churchOf(user.churchId));
  }

  @Holy365Auth()
  @RestApiDelete(OkResponse, { path: '/me', description: '회원 탈퇴 — 필사 기록도 함께 삭제' })
  async withdraw(@Holy365User() signature: Holy365Signature) {
    await this.userUseCase.withdraw(signature.id);
  }
}
