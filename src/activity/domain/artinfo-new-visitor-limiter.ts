import { Injectable, Logger } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import {
  ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP,
  ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_UA,
  ARTINFO_ACTIVITY_NEW_VISITOR_UA_WINDOW_SECONDS,
  ARTINFO_ACTIVITY_NEW_VISITOR_WINDOW_SECONDS,
  isDesktopLinuxUserAgent,
  newVisitorLimitKey,
  newVisitorUaLimitKey,
} from '@/activity/domain/artinfo-activity-policy';

/**
 * 새 방문자 상한 두 가지 — ① IP 당 한 시간, ② 같은 User-Agent 문자열당 10분.
 * 버킷(Redis SET)에 그동안 허용한 방문자 ID 를 두고, 집합이 꽉 찬 뒤 처음 보는 ID 는 거절한다.
 * 이미 들어 있는 ID 는 계속 허용해 체류시간 누적이 끊기지 않는다. IP·UA 는 Redis 키로만 머물고 DB 에는 저장하지 않는다.
 */
@Injectable()
export class ArtinfoNewVisitorLimiter {
  private readonly logger = new Logger(ArtinfoNewVisitorLimiter.name);

  constructor(private readonly redisRepository: RedisRepository) {}

  /** IP 당 한 시간에 새 방문자 10명까지. IP 를 모르면(프록시가 X-Forwarded-For 를 안 줌) 상한을 걸지 않는다 */
  async allow(ip: string | null, visitorId: string): Promise<boolean> {
    if (!ip) return true;
    return this.allowInBucket(
      newVisitorLimitKey(ip, Date.now()),
      ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP,
      ARTINFO_ACTIVITY_NEW_VISITOR_WINDOW_SECONDS,
      visitorId,
      `ip ${ip}`,
    );
  }

  /**
   * 데스크톱 Linux UA 에 한해, 같은 User-Agent 문자열당 10분에 새 방문자 30명까지 — IP 를 바꿔 가며 도는 크롤러용.
   * 그 밖의 UA(모바일·Windows·Mac)는 발송 직후 수백 명이 같은 문자열로 들어올 수 있어 상한을 걸지 않는다.
   */
  async allowByUserAgent(userAgent: string | null | undefined, visitorId: string): Promise<boolean> {
    if (!userAgent || !isDesktopLinuxUserAgent(userAgent)) return true;
    return this.allowInBucket(
      newVisitorUaLimitKey(userAgent, Date.now()),
      ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_UA,
      ARTINFO_ACTIVITY_NEW_VISITOR_UA_WINDOW_SECONDS,
      visitorId,
      `ua ${userAgent.slice(0, 120)}`,
    );
  }

  private async allowInBucket(key: string, max: number, ttlSeconds: number, visitorId: string, label: string): Promise<boolean> {
    const redis = this.redisRepository.redisClient;
    try {
      if ((await redis.sismember(key, visitorId)) === 1) return true;
      const size = await redis.scard(key);
      if (size >= max) {
        // 버킷마다 한 번만 남긴다 — 어떤 IP/UA 가 상한에 걸렸는지 로그로 볼 수 있게
        if (size === max && (await redis.sadd(`${key}:logged`, '1')) === 1) {
          await redis.expire(`${key}:logged`, ttlSeconds);
          this.logger.warn(`new-visitor cap reached (${max}/${ttlSeconds}s): ${label}`);
        }
        return false;
      }
      if ((await redis.sadd(key, visitorId)) === 1 && size === 0) {
        await redis.expire(key, ttlSeconds);
      }
      return true;
    } catch (error) {
      // 지표 보조 장치가 집계 자체를 막으면 안 된다
      this.logger.warn(`new-visitor limiter skipped: ${error instanceof Error ? error.message : String(error)}`);
      return true;
    }
  }
}
