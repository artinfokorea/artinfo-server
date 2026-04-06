import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_REPORT_REPOSITORY, IAzeyoCommunityReportRepository } from '@/azeyo/community/domain/repository/azeyo-community-report.repository.interface';
import { AZEYO_COMMUNITY_REPORT_REASON } from '@/azeyo/community/domain/entity/azeyo-community-report.entity';
import { AzeyoCommunityReportDuplicate } from '@/azeyo/community/domain/exception/azeyo-community.exception';

@Injectable()
export class AzeyoReportCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_REPORT_REPOSITORY)
    private readonly reportRepository: IAzeyoCommunityReportRepository,
  ) {}

  async execute(userId: number, postId: number, reason: AZEYO_COMMUNITY_REPORT_REASON, contents: string | null): Promise<void> {
    await this.postRepository.findOneByIdOrThrow(postId);

    const existing = await this.reportRepository.findByPostIdAndUserId(postId, userId);
    if (existing) throw new AzeyoCommunityReportDuplicate();

    await this.reportRepository.save({ userId, postId, reason, contents });
  }
}
