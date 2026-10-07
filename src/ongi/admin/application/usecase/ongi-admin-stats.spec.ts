import { OngiAdminStatsUseCase } from '@/ongi/admin/application/usecase/ongi-admin.usecase';
import { IOngiAdminRepository } from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';

function setup(overrides: Partial<IOngiAdminRepository> = {}) {
  const asked: Record<string, number> = {};
  const repository = {
    getActivitySummary: async () => ({ today: '2026-09-29', trackingSince: '2026-09-27', dau: 4, wau: 6, mau: 6 }),
    scanDailyActivity: async (days: number) => {
      asked.activity = days;

      return [
        { day: '2026-09-27', activeUsers: 3, measuredUsers: 0, seconds: 0, sessions: 0 },
        { day: '2026-09-28', activeUsers: 5, measuredUsers: 2, seconds: 1200, sessions: 6 },
        { day: '2026-09-29', activeUsers: 4, measuredUsers: 2, seconds: 600, sessions: 3 },
      ];
    },
    scanDailyContent: async (days: number) => {
      asked.content = days;

      return [
        { day: '2026-09-28', signups: 1, photos: 12, comments: 3, chatMessages: 40 },
        { day: '2026-09-29', signups: 0, photos: 2, comments: 0, chatMessages: 15 },
      ];
    },
    scanRetention: async () => [{ days: 1, cohort: 4, retained: 3 }],
    getSpaceStats: async () => ({ total: 10, solo: 4, active7d: 5, members: 23 }),
    getFunnel: async () => ({ users: 20, withGroup: 16, withPhoto: 9, withChat: 5, withPush: 14 }),
    scanPlatforms: async () => [
      { platform: 'ios', users: 4 },
      { platform: null, users: 2 },
    ],
    scanVersions: async () => [
      { version: '1.0.10', users: 3 },
      { version: null, users: 3 },
    ],
    countTestUsers: async () => 0,
    scanRetentionByRole: async () => [
      { role: 'admin', days: 1, cohort: 2, retained: 2 },
      { role: 'admin', days: 7, cohort: 1, retained: 0 },
      { role: 'member', days: 1, cohort: 2, retained: 1 },
    ],
    getActivation: async () => ({ spaces: 8, spacesWithSecondMember: 3, users: 12, usersWithPhoto: 9 }),
    scanVisitDays: async () => [
      { days: 1, users: 4 },
      { days: 3, users: 2 },
    ],
    getActiveMix: async () => ({ newUsers: 3, existing: 2, resurrected: 1 }),
    ...overrides,
  } as unknown as IOngiAdminRepository;

  return { useCase: new OngiAdminStatsUseCase(repository), asked };
}

describe('OngiAdminStatsUseCase — 관리자 지표', () => {
  it('접속자: 오늘 · 7일 · 30일, 고착도는 하루 평균 4명 ÷ 30일 6명', async () => {
    const stats = await setup().useCase.execute();

    expect(stats.today).toBe('2026-09-29');
    expect(stats.trackingSince).toBe('2026-09-27');
    expect(stats.active).toEqual({ dau: 4, wau: 6, mau: 6, stickiness: 66.7 });
  });

  it('일별 추이는 최근 30일, 기록 없는 날은 0 으로 채운다', async () => {
    const { useCase, asked } = setup();
    const stats = await useCase.execute();

    expect(asked).toEqual({ activity: 30, content: 30 });
    expect(stats.daily).toHaveLength(30);
    expect(stats.daily[0]).toEqual({
      day: '2026-08-31',
      activeUsers: 0,
      measuredUsers: 0,
      avgSeconds: 0,
      sessions: 0,
      signups: 0,
      photos: 0,
      comments: 0,
      chatMessages: 0,
    });
    expect(stats.daily.slice(27)).toEqual([
      { day: '2026-09-27', activeUsers: 3, measuredUsers: 0, avgSeconds: 0, sessions: 0, signups: 0, photos: 0, comments: 0, chatMessages: 0 },
      { day: '2026-09-28', activeUsers: 5, measuredUsers: 2, avgSeconds: 600, sessions: 6, signups: 1, photos: 12, comments: 3, chatMessages: 40 },
      { day: '2026-09-29', activeUsers: 4, measuredUsers: 2, avgSeconds: 300, sessions: 3, signups: 0, photos: 2, comments: 0, chatMessages: 15 },
    ]);
  });

  it('체류시간(최근 7일)은 시간을 잰 사용자만으로 평균 — 1800초 · 9회 · 4명', async () => {
    const stats = await setup().useCase.execute();

    expect(stats.engagement).toEqual({ measuredUserDays: 4, avgSecondsPerUser: 450, avgSessionsPerUser: 2.3, avgSecondsPerSession: 200 });
  });

  it('시간을 잰 사용자가 없으면 체류시간은 전부 0', async () => {
    const stats = await setup({
      scanDailyActivity: async () => [{ day: '2026-09-29', activeUsers: 4, measuredUsers: 0, seconds: 0, sessions: 0 }],
    }).useCase.execute();

    expect(stats.engagement).toEqual({ measuredUserDays: 0, avgSecondsPerUser: 0, avgSessionsPerUser: 0, avgSecondsPerSession: 0 });
  });

  it('재방문율은 1 · 7 · 30일, 대상자가 없는 구간은 null', async () => {
    const stats = await setup().useCase.execute();

    expect(stats.retention).toEqual([
      { days: 1, cohort: 4, retained: 3, rate: 75 },
      { days: 7, cohort: 0, retained: 0, rate: null },
      { days: 30, cohort: 0, retained: 0, rate: null },
    ]);
  });

  it('공간: 혼자인 공간 40%, 평균 2.3명', async () => {
    const stats = await setup().useCase.execute();

    expect(stats.spaces).toEqual({ total: 10, solo: 4, soloRate: 40, active7d: 5, activeRate: 50, avgMembers: 2.3 });
  });

  it('가입 후 전환: 가입자 20명 기준 비율', async () => {
    const stats = await setup().useCase.execute();

    expect(stats.funnel).toEqual({
      users: 20,
      withGroup: { count: 16, rate: 80 },
      withPhoto: { count: 9, rate: 45 },
      withChat: { count: 5, rate: 25 },
      withPush: { count: 14, rate: 70 },
    });
  });

  it("플랫폼·버전을 모르는 사용자는 'unknown'", async () => {
    const stats = await setup().useCase.execute();

    expect(stats.platforms).toEqual([
      { platform: 'ios', users: 4 },
      { platform: 'unknown', users: 2 },
    ]);
    expect(stats.versions).toEqual([
      { version: '1.0.10', users: 3 },
      { version: 'unknown', users: 3 },
    ]);
  });

  it('기록을 시작하기 전이면 접속 지표는 0, 재방문율은 전부 null', async () => {
    const stats = await setup({
      getActivitySummary: async () => ({ today: '2026-09-29', trackingSince: null, dau: 0, wau: 0, mau: 0 }),
      scanDailyActivity: async () => [],
      scanRetention: async () => [],
    }).useCase.execute();

    expect(stats.trackingSince).toBeNull();
    expect(stats.active).toEqual({ dau: 0, wau: 0, mau: 0, stickiness: 0 });
    expect(stats.retention.map(r => r.rate)).toEqual([null, null, null]);
  });

  it('역할별 재방문율 — admin · member · none 순서, 없는 구간은 null', async () => {
    const stats = await setup().useCase.execute();

    expect(stats.retentionByRole).toEqual([
      {
        role: 'admin',
        retention: [
          { days: 1, cohort: 2, retained: 2, rate: 100 },
          { days: 7, cohort: 1, retained: 0, rate: 0 },
          { days: 30, cohort: 0, retained: 0, rate: null },
        ],
      },
      {
        role: 'member',
        retention: [
          { days: 1, cohort: 2, retained: 1, rate: 50 },
          { days: 7, cohort: 0, retained: 0, rate: null },
          { days: 30, cohort: 0, retained: 0, rate: null },
        ],
      },
      {
        role: 'none',
        retention: [
          { days: 1, cohort: 0, retained: 0, rate: null },
          { days: 7, cohort: 0, retained: 0, rate: null },
          { days: 30, cohort: 0, retained: 0, rate: null },
        ],
      },
    ]);
  });

  it('7일 안 활성화 — 두 번째 가족 합류 3/8 = 37.5%, 첫 사진 9/12 = 75%', async () => {
    const stats = await setup().useCase.execute();

    expect(stats.activation).toEqual({
      windowDays: 7,
      secondMember: { cohort: 8, count: 3, rate: 37.5 },
      firstPhoto: { cohort: 12, count: 9, rate: 75 },
    });
  });

  it('방문일수 분포는 1~7일을 모두 채우고, 접속자 구성은 비율을 붙인다', async () => {
    const stats = await setup().useCase.execute();

    expect(stats.visitDays).toEqual([
      { days: 1, users: 4 },
      { days: 2, users: 0 },
      { days: 3, users: 2 },
      { days: 4, users: 0 },
      { days: 5, users: 0 },
      { days: 6, users: 0 },
      { days: 7, users: 0 },
    ]);
    expect(stats.activeMix).toEqual({
      total: 6,
      newUsers: { count: 3, rate: 50 },
      existing: { count: 2, rate: 33.3 },
      resurrected: { count: 1, rate: 16.7 },
    });
  });
});
