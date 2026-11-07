import { SchedulerLockService } from '@/common/scheduler/scheduler-lock.service';
import { ArtinfoPushScheduler } from '@/push/artinfo-push.scheduler';
import { ArtinfoPushService } from '@/push/artinfo-push.service';

/**
 * 기대값: 매일 12:00 KST 크론은 Redis 락(artinfoJobDigestPush, 일 단위 TTL)을 잡은 인스턴스만 요약 푸시를 보낸다.
 * 발송이 실패해도 스케줄러 밖으로 예외가 새지 않는다.
 */
describe('ArtinfoPushScheduler', () => {
  const pushService = { sendJobDigest: jest.fn().mockResolvedValue({ jobCount: 1, sent: 1 }) };
  const schedulerLock = { runExclusive: jest.fn() };
  const scheduler = new ArtinfoPushScheduler(pushService as unknown as ArtinfoPushService, schedulerLock as unknown as SchedulerLockService);

  beforeEach(() => jest.clearAllMocks());

  it('락을 잡으면 요약 푸시를 보낸다', async () => {
    schedulerLock.runExclusive.mockImplementation(async (_name: string, _ttl: number, task: () => Promise<void>) => {
      await task();
      return true;
    });
    await scheduler.handleDailyJobDigest();
    expect(schedulerLock.runExclusive).toHaveBeenCalledWith('artinfoJobDigestPush', 23 * 60 * 60 * 1000, expect.any(Function));
    expect(pushService.sendJobDigest).toHaveBeenCalledTimes(1);
  });

  it('다른 인스턴스가 락을 잡았으면 보내지 않는다', async () => {
    schedulerLock.runExclusive.mockResolvedValue(false);
    await scheduler.handleDailyJobDigest();
    expect(pushService.sendJobDigest).not.toHaveBeenCalled();
  });

  it('발송이 실패해도 예외가 새지 않는다', async () => {
    schedulerLock.runExclusive.mockImplementation(async (_name: string, _ttl: number, task: () => Promise<void>) => {
      await task();
      return true;
    });
    pushService.sendJobDigest.mockRejectedValueOnce(new Error('expo down'));
    await expect(scheduler.handleDailyJobDigest()).resolves.toBeUndefined();
  });
});
