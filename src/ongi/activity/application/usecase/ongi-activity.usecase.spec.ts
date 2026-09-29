import { OngiRecordActivityPingUseCase } from '@/ongi/activity/application/usecase/ongi-activity.usecase';
import { IOngiActivityRepository, OngiActivityPing } from '@/ongi/activity/domain/repository/ongi-activity.repository.interface';

function setup() {
  const saved: OngiActivityPing[] = [];
  const repository = {
    addPing: async (ping: OngiActivityPing) => {
      saved.push(ping);
    },
  } as unknown as IOngiActivityRepository;

  return { useCase: new OngiRecordActivityPingUseCase(repository), saved };
}

describe('OngiRecordActivityPingUseCase — 앱이 보낸 사용 시간 기록', () => {
  it('앱을 연 직후: 시간 0초, 새 방문 1회, 플랫폼·버전을 기록', async () => {
    const { useCase, saved } = setup();

    await useCase.execute(30, { seconds: 0, newSession: true, platform: 'ios', appVersion: '1.0.10' });

    expect(saved).toEqual([{ userId: 30, seconds: 0, sessions: 1, platform: 'ios', appVersion: '1.0.10' }]);
  });

  it('쓰는 중: 지난 시간만큼 더하고 방문 수는 그대로', async () => {
    const { useCase, saved } = setup();

    await useCase.execute(30, { seconds: 60, newSession: false, platform: 'android', appVersion: '1.0.10' });

    expect(saved).toEqual([{ userId: 30, seconds: 60, sessions: 0, platform: 'android', appVersion: '1.0.10' }]);
  });

  it('이상한 값은 걸러낸다 — 시간은 30분까지, 모르는 플랫폼·버전은 null', async () => {
    const { useCase, saved } = setup();

    await useCase.execute(30, { seconds: 90000, newSession: undefined, platform: 'web', appVersion: 'latest' });

    expect(saved).toEqual([{ userId: 30, seconds: 1800, sessions: 0, platform: null, appVersion: null }]);
  });

  it('newSession 은 true 일 때만 방문으로 센다', async () => {
    const { useCase, saved } = setup();

    await useCase.execute(30, { seconds: 10, newSession: 'true' as unknown as boolean });

    expect(saved).toEqual([{ userId: 30, seconds: 10, sessions: 0, platform: null, appVersion: null }]);
  });
});
