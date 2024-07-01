import { Module } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Module({
  providers: [RedisRepository],
})
export class RedisModule {}
