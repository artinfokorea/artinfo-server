import { Body, Param, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { RestApiController, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature, UploadFile } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { AzeyoUploadProfileImageUseCase } from '@/azeyo/user/application/usecase/azeyo-upload-profile-image.usecase';
import { AzeyoScanMyProfileUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-my-profile.usecase';
import { AzeyoScanUserProfileUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-user-profile.usecase';
import { AzeyoEditProfileUseCase } from '@/azeyo/user/application/usecase/azeyo-edit-profile.usecase';
import { AzeyoScanTopMonthlyUsersUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-top-monthly-users.usecase';
import { AzeyoScanMyPostsUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-my-posts.usecase';
import { AzeyoReportUserUseCase } from '@/azeyo/user/application/usecase/azeyo-report-user.usecase';
import { AzeyoEditProfileRequest } from '@/azeyo/user/presentation/dto/request/azeyo-edit-profile.request';
import { AzeyoUserProfileResponse } from '@/azeyo/user/presentation/dto/response/azeyo-user-profile.response';
import { AzeyoPublicUserProfileResponse } from '@/azeyo/user/presentation/dto/response/azeyo-public-user-profile.response';
import { AzeyoTopUsersResponse } from '@/azeyo/user/presentation/dto/response/azeyo-top-users.response';
import { AzeyoCommunityPostsResponse } from '@/azeyo/community/presentation/dto/response/azeyo-community-post.response';
import { AZEYO_USER_REPORT_REASON } from '@/azeyo/user/domain/entity/azeyo-user-report.entity';
import { List } from '@/common/type/type';

@RestApiController('/azeyo/users', 'Azeyo User')
export class AzeyoUserController {
  constructor(
    private readonly scanMyProfileUseCase: AzeyoScanMyProfileUseCase,
    private readonly editProfileUseCase: AzeyoEditProfileUseCase,
    private readonly scanTopMonthlyUsersUseCase: AzeyoScanTopMonthlyUsersUseCase,
    private readonly scanMyPostsUseCase: AzeyoScanMyPostsUseCase,
    private readonly uploadProfileImageUseCase: AzeyoUploadProfileImageUseCase,
    private readonly scanUserProfileUseCase: AzeyoScanUserProfileUseCase,
    private readonly reportUserUseCase: AzeyoReportUserUseCase,
  ) {}

  @RestApiGet(AzeyoUserProfileResponse, { path: '/me', description: '내 프로필 조회', auth: [USER_TYPE.CLIENT] })
  async scanMyProfile(@AuthSignature() signature: UserSignature) {
    const user = await this.scanMyProfileUseCase.execute(signature.id);
    return new AzeyoUserProfileResponse(user);
  }

  @RestApiPut(OkResponse, { path: '/me', description: '프로필 수정', auth: [USER_TYPE.CLIENT] })
  async editProfile(@AuthSignature() signature: UserSignature, @Body() request: AzeyoEditProfileRequest) {
    await this.editProfileUseCase.execute(signature.id, {
      name: request.name ?? undefined,
      nickname: request.nickname,
      subtitle: request.subtitle ?? null,
      email: request.email ?? undefined,
      phone: request.phone ?? undefined,
    });
    return new OkResponse();
  }

  @RestApiPost(OkResponse, { path: '/upload/profile-image', description: '프로필 이미지 업로드', auth: [USER_TYPE.CLIENT] })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadProfileImage(@AuthSignature() signature: UserSignature, @UploadedFile() file: UploadFile) {
    const url = await this.uploadProfileImageUseCase.execute(signature.id, file);
    return { url };
  }

  @RestApiGet(AzeyoTopUsersResponse, { path: '/top-monthly', description: '이달의 활동왕 조회' })
  async scanTopMonthlyUsers(@Query('count') count: number) {
    const users = await this.scanTopMonthlyUsersUseCase.execute(count || 3);
    return new AzeyoTopUsersResponse(users);
  }

  @RestApiGet(AzeyoCommunityPostsResponse, { path: '/me/posts', description: '내 게시글 조회', auth: [USER_TYPE.CLIENT] })
  async scanMyPosts(@AuthSignature() signature: UserSignature, @Query() query: List) {
    const result = await this.scanMyPostsUseCase.execute(signature.id, query.page, query.size);
    return new AzeyoCommunityPostsResponse(result);
  }

  @RestApiGet(AzeyoPublicUserProfileResponse, { path: '/:userId', description: '유저 공개 프로필 조회' })
  async scanUserProfile(@Param('userId') userId: number) {
    const user = await this.scanUserProfileUseCase.execute(userId);
    return new AzeyoPublicUserProfileResponse(user);
  }

  @RestApiPost(OkResponse, { path: '/:userId/report', description: '유저 신고', auth: [USER_TYPE.CLIENT] })
  async reportUser(
    @AuthSignature() signature: UserSignature,
    @Param('userId') userId: number,
    @Body('reason') reason: AZEYO_USER_REPORT_REASON,
    @Body('contents') contents: string | null,
  ) {
    await this.reportUserUseCase.execute(signature.id, userId, reason, contents ?? null);
    return new OkResponse();
  }
}
