import { Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadFile } from '@/common/type/type';
import { HOLY365_AVATAR_MAX_BYTES } from '@/holy365/user/domain/service/holy365-avatar-policy';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: HOLY365_AVATAR_MAX_BYTES } }))
  @RestApiPost(Holy365UserResponse, { path: '/me/avatar', description: '프로필 사진 올리기 (jpg·png·webp·gif, 10MB 이하 → 400×400 WebP)' })
  async uploadAvatar(@Holy365User() signature: Holy365Signature, @UploadedFile() file: UploadFile) {
    const user = await this.userUseCase.uploadAvatar(signature.id, file);
    return new Holy365UserResponse(user, await this.socialService.churchOf(user.churchId));
  }

  @Holy365Auth()
  @RestApiDelete(Holy365UserResponse, { path: '/me/avatar', description: '프로필 사진 지우기' })
  async removeAvatar(@Holy365User() signature: Holy365Signature) {
    const user = await this.userUseCase.removeAvatar(signature.id);
    return new Holy365UserResponse(user, await this.socialService.churchOf(user.churchId));
  }

  @Holy365Auth()
  @RestApiDelete(OkResponse, { path: '/me', description: '회원 탈퇴 — 필사 기록도 함께 삭제' })
  async withdraw(@Holy365User() signature: Holy365Signature) {
    await this.userUseCase.withdraw(signature.id);
  }
}
