import { Injectable, Logger } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import {
  ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP,
  ARTINFO_ACTIVITY_NEW_VISITOR_WINDOW_SECONDS,
  newVisitorLimitKey,
} from '@/activity/domain/artinfo-activity-policy';

/**
 * IP 당 새 방문자 상한. 한 IP 에서 한 시간에 허용한 방문자 ID 를 Redis SET 에 두고,
 * 집합이 꽉 찬 뒤 처음 보는 ID 는 거절한다. 이미 들어 있는 ID 는 계속 허용해 체류시간 누적이 끊기지 않는다.
 * IP 는 Redis 키로만 한 시간 머물고 DB 에는 저장하지 않는다.
 */
@Injectable()
export class ArtinfoNewVisitorLimiter {
  private readonly logger = new Logger(ArtinfoNewVisitorLimiter.name);

  constructor(private readonly redisRepository: RedisRepository) {}

  async allow(ip: string | null, visitorId: string): Promise<boolean> {
    if (!ip) return true;
    const redis = this.redisRepository.redisClient;
    const key = newVisitorLimitKey(ip, Date.now());
    try {
      if ((await redis.sismember(key, visitorId)) === 1) return true;
      if ((await redis.scard(key)) >= ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP) return false;
      if ((await redis.sadd(key, visitorId)) === 1 && (await redis.scard(key)) === 1) {
        await redis.expire(key, ARTINFO_ACTIVITY_NEW_VISITOR_WINDOW_SECONDS);
      }
      return true;
    } catch (error) {
      // 지표 보조 장치가 집계 자체를 막으면 안 된다
      this.logger.warn(`new-visitor limiter skipped: ${error instanceof Error ? error.message : String(error)}`);
      return true;
    }
  }
}
