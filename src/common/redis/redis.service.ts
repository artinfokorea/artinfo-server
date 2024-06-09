import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { RedisSetCommand } from '@/common/redis/dto/redis-set.command';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  getByKey(key: string) {
    return this.cacheManager.get(key);
  }

  async setValue(command: RedisSetCommand) {
    await this.cacheManager.set(command.key, command.value, { ttl: command.ttl } as any);
  }

  async delete(key: string) {
    await this.cacheManager.del(key);
  }
}
