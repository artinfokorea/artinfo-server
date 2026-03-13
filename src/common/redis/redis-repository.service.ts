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
}
