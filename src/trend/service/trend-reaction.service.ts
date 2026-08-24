import { Injectable } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { TREND_REACTIONS, TrendReaction } from '@/trend/dto/request/trend-reaction.request';
import { TrendReactionsResponse } from '@/trend/dto/response/trend-reaction.response';

// 이슈 수명보다 넉넉하게 — 마지막 투표 기준으로 연장된다
const KEY_TTL_SEC = 14 * 24 * 60 * 60;

/** 요약 하단 "이 이슈 어떻게 보세요?" 익명 이모지 투표 — Redis 해시 카운터, DDL 불필요 */
@Injectable()
export class TrendReactionService {
  constructor(private readonly redis: RedisRepository) {}

  async getCounts(keyword: string): Promise<TrendReactionsResponse> {
    const raw = await this.redis.redisClient.hgetall(this.key(keyword));
    return this.toResponse(keyword, raw);
  }

  async add(keyword: string, reaction: TrendReaction, previous?: TrendReaction): Promise<TrendReactionsResponse> {
    const key = this.key(keyword);
    const multi = this.redis.redisClient.multi().hincrby(key, reaction, 1);
    if (previous && previous !== reaction) multi.hincrby(key, previous, -1);
    await multi.expire(key, KEY_TTL_SEC).exec();
    return this.getCounts(keyword);
  }

  private toResponse(keyword: string, raw: Record<string, string>): TrendReactionsResponse {
    const counts = Object.fromEntries(
      // 이전 반응 차감이 중복 요청되면 음수가 될 수 있어 0으로 클램프
      TREND_REACTIONS.map(r => [r, Math.max(0, Number(raw[r] ?? 0))]),
    ) as Record<TrendReaction, number>;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return new TrendReactionsResponse({ keyword, counts, total });
  }

  private key(keyword: string): string {
    return `trend:reactions:kr:${keyword.trim().replace(/\s+/g, ' ').toLowerCase()}`;
  }
}
