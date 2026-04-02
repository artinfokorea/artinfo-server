import { Body, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { AzeyoScanMyProfileUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-my-profile.usecase';
import { AzeyoEditProfileUseCase } from '@/azeyo/user/application/usecase/azeyo-edit-profile.usecase';
import { AzeyoScanTopMonthlyUsersUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-top-monthly-users.usecase';
import { AzeyoScanMyPostsUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-my-posts.usecase';
import { AzeyoEditProfileRequest } from '@/azeyo/user/presentation/dto/request/azeyo-edit-profile.request';
import { AzeyoUserProfileResponse } from '@/azeyo/user/presentation/dto/response/azeyo-user-profile.response';
import { AzeyoTopUsersResponse } from '@/azeyo/user/presentation/dto/response/azeyo-top-users.response';
import { AzeyoCommunityPostsResponse } from '@/azeyo/community/presentation/dto/response/azeyo-community-post.response';
import { List } from '@/common/type/type';

@RestApiController('/azeyo/users', 'Azeyo User')
export class AzeyoUserController {
  constructor(
    private readonly scanMyProfileUseCase: AzeyoScanMyProfileUseCase,
    private readonly editProfileUseCase: AzeyoEditProfileUseCase,
    private readonly scanTopMonthlyUsersUseCase: AzeyoScanTopMonthlyUsersUseCase,
    private readonly scanMyPostsUseCase: AzeyoScanMyPostsUseCase,
  ) {}

  @RestApiGet(AzeyoUserProfileResponse, { path: '/me', description: '내 프로필 조회', auth: [USER_TYPE.CLIENT] })
  async scanMyProfile(@AuthSignature() signature: UserSignature) {
    const user = await this.scanMyProfileUseCase.execute(signature.id);
    return new AzeyoUserProfileResponse(user);
  }

  @RestApiPut(OkResponse, { path: '/me', description: '프로필 수정', auth: [USER_TYPE.CLIENT] })
  async editProfile(@AuthSignature() signature: UserSignature, @Body() request: AzeyoEditProfileRequest) {
    await this.editProfileUseCase.execute(signature.id, request.nickname, request.subtitle ?? null);
    return new OkResponse();
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
}
