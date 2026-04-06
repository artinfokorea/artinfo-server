import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AzeyoCreateCommunityPostCommand } from '@/azeyo/community/application/command/azeyo-create-community-post.command';
import { AZEYO_ACTIVITY_POINTS_SERVICE, IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoCommunityWriteBanned } from '@/azeyo/community/domain/exception/azeyo-community.exception';

@Injectable()
export class AzeyoCreateCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_ACTIVITY_POINTS_SERVICE)
    private readonly activityPointsService: IAzeyoActivityPointsService,
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,
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
    return post.id;
  }
}
