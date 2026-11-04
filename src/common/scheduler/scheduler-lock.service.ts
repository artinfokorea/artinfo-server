import { Injectable, Logger } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';

/**
 * 서버 인스턴스가 2대라 같은 @Cron 이 동시에 두 번 깬다. Redis SET NX 락으로 한 대만 실행한다.
 * 락은 작업이 끝나도 지우지 않고 TTL 로만 푼다 — 끝나자마자 풀면 몇 ms 늦게 깬 다른 인스턴스가 또 잡는다.
 * 그래서 TTL 은 "다음 실행 주기보다 짧고, 인스턴스 간 시계 차이보다 긴" 값으로 준다.
 */
@Injectable()
export class SchedulerLockService {
  private readonly logger = new Logger(SchedulerLockService.name);

  constructor(private readonly redisRepository: RedisRepository) {}

  /** 락을 잡았으면 task 를 실행하고 true, 다른 인스턴스가 잡았으면 건너뛰고 false */
  async runExclusive(name: string, ttlMs: number, task: () => Promise<void>): Promise<boolean> {
    let locked = true;
    try {
      locked = await this.redisRepository.acquireLock(`SCHEDULER:LOCK=${name}`, ttlMs);
    } catch (error) {
      // Redis 장애 때는 둘 다 도는 쪽이 아무도 안 도는 것보다 낫다
      this.logger.warn(`[${name}] 스케줄 락 확인 실패, 그냥 실행: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!locked) {
      this.logger.log(`[${name}] 다른 인스턴스가 실행 중이라 건너뜀`);
      return false;
    }
    await task();
    return true;
  }
}

/** 실행 주기별 락 TTL — 주기보다 짧게 둬서 다음 실행은 다시 경쟁한다 */
export const SCHEDULER_LOCK_TTL_MS = {
  EVERY_MINUTE: 50 * 1000,
  EVERY_10_MINUTES: 9 * 60 * 1000,
  HOURLY: 55 * 60 * 1000,
  DAILY: 23 * 60 * 60 * 1000,
} as const;
