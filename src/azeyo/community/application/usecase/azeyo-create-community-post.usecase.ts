import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AzeyoCreateCommunityPostCommand } from '@/azeyo/community/application/command/azeyo-create-community-post.command';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoCommunityWriteBanned } from '@/azeyo/community/domain/exception/azeyo-community.exception';
import { SystemService } from '@/system/service/system.service';

@Injectable()
export class AzeyoCreateCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,

    private readonly systemService: SystemService,
  ) {}

  async execute(command: AzeyoCreateCommunityPostCommand): Promise<number> {
    const user = await this.userRepository.findOneOrThrowById(command.userId);
    if (user.isWriteBanned) throw new AzeyoCommunityWriteBanned();

    const post = await this.postRepository.create({
      userId: command.userId,
      type: command.type,
      category: command.category,
      title: command.title,
      contents: command.contents,
      imageUrls: command.imageUrls,
      imageRatio: command.imageRatio,
      voteOptionA: command.voteOptionA,
      voteOptionB: command.voteOptionB,
    });
    await this.activityPointsService.addPoints(command.userId, AZEYO_ACTIVITY_ACTION.CREATE_POST);

    // 새 게시글 관리자 알림 메일
    try {
      await this.systemService.sendEmail(
        'chorales@naver.com',
        '[아재요] 새 게시글 알림',
        `<h3>새 게시글</h3><p>유저ID: ${command.userId}<br/>제목: ${command.title}</p>`,
      );
    } catch (e) {
      console.error('[Community] 알림 메일 발송 실패:', e);
    }

    return post.id;
  }
}
