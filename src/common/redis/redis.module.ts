import { Module } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service';

@Module({
  providers: [RedisService],
})
export class RedisModule {}
