import { Module } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { SchedulerLockService } from '@/common/scheduler/scheduler-lock.service';

/** 스케줄러가 있는 모듈마다 import 해서 SchedulerLockService 를 주입받는다 */
@Module({
  providers: [RedisRepository, SchedulerLockService],
  exports: [SchedulerLockService],
})
export class SchedulerLockModule {}
