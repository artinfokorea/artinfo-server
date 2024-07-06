import { Injectable } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Job } from '@/job/entity/job.entity';

@Injectable()
export class JobEvent {
  constructor(private readonly redisService: RedisRepository) {}

  @OnEvent('job.fetched')
  async handleJobFetchedEvent(key: string, job: Job) {
    await this.redisService.setValue({
      key: key,
      value: job,
      ttl: 3600,
    });
  }

  @OnEvent('jobs.fetched')
  async handleJobsFetchedEvent(key: string, jobs: Job[]) {
    await this.redisService.setValue({
      key: key,
      value: jobs,
      ttl: 3600,
    });
  }

  @OnEvent('jobs-count.fetched')
  async handleCountJobsFetchedEvent(key: string, totalCount: number) {
    await this.redisService.setValue({
      key: key,
      value: totalCount,
      ttl: 3600,
    });
  }
}
