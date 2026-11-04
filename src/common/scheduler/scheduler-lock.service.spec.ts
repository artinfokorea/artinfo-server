import { SchedulerLockService } from '@/common/scheduler/scheduler-lock.service';
import { RedisRepository } from '@/common/redis/redis-repository.service';

function build(acquireLock: jest.Mock) {
  const redis = { acquireLock, delete: jest.fn() } as unknown as RedisRepository;
  return { service: new SchedulerLockService(redis), redis };
}

describe('SchedulerLockService.runExclusive — 인스턴스 2대 중 하나만 실행', () => {
  it('락을 잡은 인스턴스는 작업을 실행하고 true', async () => {
    const acquireLock = jest.fn().mockResolvedValue(true);
    const { service } = build(acquireLock);
    const task = jest.fn().mockResolvedValue(undefined);

    await expect(service.runExclusive('dailyScrap', 50_000, task)).resolves.toBe(true);
    expect(task).toHaveBeenCalledTimes(1);
    expect(acquireLock).toHaveBeenCalledWith('SCHEDULER:LOCK=dailyScrap', 50_000);
  });

  it('락을 못 잡은 인스턴스는 작업을 건너뛰고 false', async () => {
    const { service } = build(jest.fn().mockResolvedValue(false));
    const task = jest.fn();

    await expect(service.runExclusive('dailyScrap', 50_000, task)).resolves.toBe(false);
    expect(task).not.toHaveBeenCalled();
  });

  it('작업이 끝나도 락을 지우지 않는다 — 몇 ms 늦게 깬 다른 인스턴스가 또 실행하지 않도록 TTL 로만 푼다', async () => {
    const { service, redis } = build(jest.fn().mockResolvedValue(true));
    await service.runExclusive('dailyScrap', 50_000, async () => undefined);
    expect(redis.delete).not.toHaveBeenCalled();
  });

  it('작업이 던진 오류는 그대로 올라간다 (스케줄러의 기존 try/catch 가 처리)', async () => {
    const { service } = build(jest.fn().mockResolvedValue(true));
    await expect(
      service.runExclusive('dailyScrap', 50_000, async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
  });

  it('Redis 가 죽어 있으면 그냥 실행한다 — 둘 다 도는 것이 아무도 안 도는 것보다 낫다', async () => {
    const { service } = build(jest.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const task = jest.fn().mockResolvedValue(undefined);

    await expect(service.runExclusive('dailyScrap', 50_000, task)).resolves.toBe(true);
    expect(task).toHaveBeenCalledTimes(1);
  });
});
