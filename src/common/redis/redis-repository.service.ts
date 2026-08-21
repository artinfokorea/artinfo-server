import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisSetCommand } from '@/common/redis/dto/redis-set.command';
import * as Redis from 'ioredis';

@Injectable()
export class RedisRepository implements OnModuleDestroy {
  readonly redisClient: Redis.Redis;

  constructor() {
    this.redisClient = new Redis.Redis({
      host: process.env['REDIS_HOST'],
      port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  async getByKey(key: string) {
    const value = await this.redisClient.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }

  async setValue(command: RedisSetCommand) {
    const valueJSON = JSON.stringify(command.value);
    await this.redisClient.set(command.key, valueJSON, 'EX', command.ttl);
  }

  // 분산 락 획득 시도. 이미 잡혀 있으면 false. (SET key 1 PX ttl NX)
  async acquireLock(key: string, ttlMs: number): Promise<boolean> {
    const result = await this.redisClient.set(key, '1', 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  async delete(key: string) {
    await this.redisClient.del(key);
  }

  async deleteByPattern(pattern: string) {
    const keys: string[] = await this.redisClient.keys(pattern);

    if (keys.length) {
      await this.redisClient.del(...keys);
    }
  }

  async deleteAll() {
    await this.redisClient.flushall();
  }

  /** 보호 접두사로 시작하는 키만 남기고 모두 삭제 (SCAN 기반, 블로킹 없음) */
  async deleteAllExcept(protectedPrefixes: string[]): Promise<number> {
    let deleted = 0;
    const stream = this.redisClient.scanStream({ count: 500 });
    for await (const batch of stream as AsyncIterable<string[]>) {
      const targets = batch.filter(k => !protectedPrefixes.some(p => k.startsWith(p)));
      if (targets.length > 0) deleted += await this.redisClient.unlink(...targets);
    }
    return deleted;
  }
}
