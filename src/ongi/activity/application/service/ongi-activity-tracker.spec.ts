import { OngiActivityTracker } from '@/ongi/activity/application/service/ongi-activity-tracker';
import { IOngiActivityRepository } from '@/ongi/activity/domain/repository/ongi-activity.repository.interface';

function setup(options: { fail?: boolean } = {}) {
  const touched: { userId: number; accessToken: string }[] = [];
  const repository = {
    touch: async (userId: number, accessToken: string) => {
      if (options.fail) throw new Error('db down');
      touched.push({ userId, accessToken });
    },
  } as unknown as IOngiActivityRepository;

  return { tracker: new OngiActivityTracker(repository), touched };
}

describe('OngiActivityTracker.track — 인증된 요청이 오면 그날의 접속을 기록', () => {
  it('처음 온 요청은 기록한다', async () => {
    const { tracker, touched } = setup();

    await tracker.track(30, 'token-a', new Date('2026-09-29T03:00:00Z'));

    expect(touched).toEqual([{ userId: 30, accessToken: 'token-a' }]);
  });

  it('같은 사용자의 요청이 5분 안에 또 오면 DB 에 쓰지 않는다', async () => {
    const { tracker, touched } = setup();

    await tracker.track(30, 'token-a', new Date('2026-09-29T03:00:00Z'));
    await tracker.track(30, 'token-a', new Date('2026-09-29T03:00:01Z'));
    await tracker.track(30, 'token-a', new Date('2026-09-29T03:04:59Z'));

    expect(touched).toEqual([{ userId: 30, accessToken: 'token-a' }]);
  });

  it('5분이 지나면 다시 쓴다', async () => {
    const { tracker, touched } = setup();

    await tracker.track(30, 'token-a', new Date('2026-09-29T03:00:00Z'));
    await tracker.track(30, 'token-a', new Date('2026-09-29T03:05:00Z'));

    expect(touched).toEqual([
      { userId: 30, accessToken: 'token-a' },
      { userId: 30, accessToken: 'token-a' },
    ]);
  });

  it('사용자마다 따로 센다', async () => {
    const { tracker, touched } = setup();

    await tracker.track(30, 'token-a', new Date('2026-09-29T03:00:00Z'));
    await tracker.track(31, 'token-b', new Date('2026-09-29T03:00:01Z'));

    expect(touched).toEqual([
      { userId: 30, accessToken: 'token-a' },
      { userId: 31, accessToken: 'token-b' },
    ]);
  });

  it('사용자 id 나 토큰이 없으면 아무것도 하지 않는다', async () => {
    const { tracker, touched } = setup();

    await tracker.track(undefined, 'token-a', new Date('2026-09-29T03:00:00Z'));
    await tracker.track(30, '', new Date('2026-09-29T03:00:00Z'));

    expect(touched).toEqual([]);
  });

  it('기록이 실패해도 예외를 던지지 않는다 — 통계 때문에 요청이 실패하면 안 된다', async () => {
    const { tracker } = setup({ fail: true });

    await expect(tracker.track(30, 'token-a', new Date('2026-09-29T03:00:00Z'))).resolves.toBeUndefined();
  });

  it('기록에 실패한 요청은 센 것으로 치지 않는다 — 다음 요청에서 다시 시도', async () => {
    const calls: number[] = [];
    let fail = true;
    const repository = {
      touch: async (userId: number) => {
        calls.push(userId);
        if (fail) throw new Error('db down');
      },
    } as unknown as IOngiActivityRepository;
    const tracker = new OngiActivityTracker(repository);

    await tracker.track(30, 'token-a', new Date('2026-09-29T03:00:00Z'));
    fail = false;
    await tracker.track(30, 'token-a', new Date('2026-09-29T03:00:05Z'));

    expect(calls).toEqual([30, 30]);
  });
});
