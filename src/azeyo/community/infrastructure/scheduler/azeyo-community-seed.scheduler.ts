import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as Redis from 'ioredis';
import { AzeyoSeedCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-seed-community-post.usecase';

const LOCK_KEY = 'azeyo:scheduler:community-seed:lock';
const LOCK_TTL = 300; // 5분

@Injectable()
export class AzeyoCommunitySeedScheduler implements OnModuleDestroy {
  private readonly logger = new Logger(AzeyoCommunitySeedScheduler.name);
  private readonly redis: Redis.Redis;

  constructor(
    private readonly seedPostUseCase: AzeyoSeedCommunityPostUseCase,
  ) {
    this.redis = new Redis.Redis({
      host: process.env['REDIS_HOST'],
      port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * 매 정시 실행 (07:00 ~ 23:00 KST)
   * Redis SET NX로 분산 락을 잡아 한 인스턴스만 실행
   */
  @Cron('0 0 7-23 * * *', {
    name: 'azeyoCommunitySeed',
    timeZone: 'Asia/Seoul',
  })
  async handleSeedPost() {
    const acquired = await this.redis.set(LOCK_KEY, '1', 'EX', LOCK_TTL, 'NX');
    if (!acquired) {
      this.logger.log('다른 인스턴스에서 실행 중 — 스킵');
      return;
    }

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
