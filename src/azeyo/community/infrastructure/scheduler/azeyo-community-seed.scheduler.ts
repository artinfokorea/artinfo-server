import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AzeyoSeedCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-seed-community-post.usecase';

@Injectable()
export class AzeyoCommunitySeedScheduler {
  private readonly logger = new Logger(AzeyoCommunitySeedScheduler.name);

  constructor(
    private readonly seedPostUseCase: AzeyoSeedCommunityPostUseCase,
  ) {}

  /**
   * 매 정시 실행 (07:00 ~ 23:00 KST)
   * cron: 초 분 시 일 월 요일
   * 0 0 7-23 * * * → 매일 7시~23시 정시
   */
  @Cron('0 0 7-23 * * *', {
    name: 'azeyoCommunitySeed',
    timeZone: 'Asia/Seoul',
  })
  async handleSeedPost() {
    const startTime = Date.now();
    this.logger.log('커뮤니티 시드 글 생성 스케줄러 시작');

    try {
      const result = await this.seedPostUseCase.execute();
      const durationMs = Date.now() - startTime;
      this.logger.log(
        `커뮤니티 시드 글 생성 완료: postId=${result.postId}, comments=${result.commentCount} (${durationMs}ms)`,
      );
    } catch (err) {
      const durationMs = Date.now() - startTime;
      this.logger.error(
        `커뮤니티 시드 글 생성 실패 (${durationMs}ms)`,
        err,
      );
    }
  }
}
