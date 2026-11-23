import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_COMMUNITY_POST_REPOSITORY,
  IOnchurchCommunityPostRepository,
} from '@/onchurch/community/domain/repository/onchurch-community-post.repository.interface';
import { OnchurchCommunityPost } from '@/onchurch/community/domain/entity/onchurch-community-post.entity';
import { OnchurchCommunityPostWriteCommand } from '@/onchurch/community/application/command/onchurch-community-post-write.command';
import { OnchurchCommunityChurchResolver } from '@/onchurch/community/application/usecase/onchurch-community-post-church-resolver.service';
import { OnchurchPushService } from '@/onchurch/push/onchurch-push.service';

@Injectable()
export class OnchurchCreateMyCommunityPostUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IOnchurchCommunityPostRepository,
    private readonly resolver: OnchurchCommunityChurchResolver,
    private readonly push: OnchurchPushService,
  ) {}

  async execute(userId: number, command: OnchurchCommunityPostWriteCommand): Promise<OnchurchCommunityPost> {
    const { user, churchId } = await this.resolver.resolve(userId);
    const post = await this.postRepository.create(churchId, {
      authorId: user.id,
      authorName: user.name,
      category: command.category,
      title: command.title,
      content: command.content,
      photoUrls: command.photoUrls,
      photoRatio: command.photoRatio,
      videoUrl: command.videoUrl,
    });
    // 교회 사람들에게 앱 알림 — 응답을 기다리게 하지 않는다 (발송 실패는 서비스가 삼킨다)
    void this.push.notifyCommunityPost({ churchId, authorId: user.id, authorName: user.name, postId: post.id, title: post.title });
    return post;
  }
}
