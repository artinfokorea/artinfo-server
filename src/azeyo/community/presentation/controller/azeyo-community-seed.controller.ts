import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { AzeyoSeedCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-seed-community-post.usecase';

@RestApiController('/azeyo/communities/seed', 'Azeyo Community Seed')
export class AzeyoCommunitySeedController {
  constructor(
    private readonly seedPostUseCase: AzeyoSeedCommunityPostUseCase,
  ) {}

  @RestApiPost(OkResponse, { path: '/generate', description: 'AI로 커뮤니티 게시글/댓글 생성' })
  async generateSeedPost() {
    const result = await this.seedPostUseCase.execute();
    return { ok: true, postId: result.postId, commentCount: result.commentCount, likeCount: result.likeCount };
  }
}
