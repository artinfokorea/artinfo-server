import { OngiAdminDirectoryUseCase, OngiAdminStatsUseCase } from '@/ongi/admin/application/usecase/ongi-admin.usecase';
import { IOngiAdminRepository, OngiAdminUserRow } from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';
import { OngiAdminNotFound } from '@/ongi/admin/domain/exception/ongi-admin.exception';
import { toAdminUserItem } from '@/ongi/admin/presentation/dto/response/ongi-admin.response';

const userOf = (overrides: Partial<OngiAdminUserRow> = {}): OngiAdminUserRow => ({
  id: 30,
  name: '심사용 계정',
  email: 'review@ongifamily.com',
  snsType: 'google',
  type: 'USER',
  isTest: false,
  createdAt: new Date('2026-09-20T01:00:00Z'),
  deletedAt: null,
  lastSeenAt: null,
  groupCount: 1,
  photoCount: 4,
  groups: [],
  ...overrides,
});

function setup(user: OngiAdminUserRow | null) {
  const saved: { userId: number; isTest: boolean }[] = [];
  const repository = {
    findUserById: async () => user,
    updateUserTest: async (userId: number, isTest: boolean) => {
      saved.push({ userId, isTest });
    },
  } as unknown as IOngiAdminRepository;

  return { useCase: new OngiAdminDirectoryUseCase(repository), saved };
}

const ACTOR = { userId: 7, type: 'SUPER_ADMIN' } as const;

describe('OngiAdminDirectoryUseCase.setTest — 테스트 계정 지정', () => {
  it('테스트 계정으로 지정한다', async () => {
    const { useCase, saved } = setup(userOf());

    await useCase.setTest(ACTOR, 30, true);

    expect(saved).toEqual([{ userId: 30, isTest: true }]);
  });

  it('지정을 푼다', async () => {
    const { useCase, saved } = setup(userOf({ isTest: true }));

    await useCase.setTest(ACTOR, 30, false);

    expect(saved).toEqual([{ userId: 30, isTest: false }]);
  });

  it('내 계정도 지정할 수 있다 — 운영자 본인의 사용이 수치에 섞이지 않게', async () => {
    const { useCase, saved } = setup(userOf({ id: 7, type: 'SUPER_ADMIN' }));

    await useCase.setTest(ACTOR, 7, true);

    expect(saved).toEqual([{ userId: 7, isTest: true }]);
  });

  it('탈퇴한 사용자도 지정할 수 있다 — 테스트하다 탈퇴한 계정이 가입·재방문 수치에 남는다', async () => {
    const { useCase, saved } = setup(userOf({ deletedAt: new Date('2026-09-25T01:00:00Z') }));

    await useCase.setTest(ACTOR, 30, true);

    expect(saved).toEqual([{ userId: 30, isTest: true }]);
  });

  it('없는 사용자면 NotFound, 아무것도 바꾸지 않는다', async () => {
    const { useCase, saved } = setup(null);

    await expect(useCase.setTest(ACTOR, 999, true)).rejects.toBeInstanceOf(OngiAdminNotFound);
    expect(saved).toEqual([]);
  });
});

describe('사용자 응답 — 테스트 계정 여부', () => {
  it('isTest 를 내려준다', () => {
    expect(toAdminUserItem(userOf({ isTest: true })).isTest).toBe(true);
    expect(toAdminUserItem(userOf()).isTest).toBe(false);
  });
});

describe('OngiAdminStatsUseCase — 수치에서 뺀 테스트 계정 수', () => {
  it('몇 개를 뺐는지 함께 알려준다', async () => {
    const repository = {
      getActivitySummary: async () => ({ today: '2026-09-29', trackingSince: null, dau: 0, wau: 0, mau: 0 }),
      scanDailyActivity: async () => [],
      scanDailyContent: async () => [],
      scanRetention: async () => [],
      getSpaceStats: async () => ({ total: 0, solo: 0, active7d: 0, members: 0 }),
      getFunnel: async () => ({ users: 0, withGroup: 0, withPhoto: 0, withChat: 0, withPush: 0 }),
      scanPlatforms: async () => [],
      scanVersions: async () => [],
      countTestUsers: async () => 3,
      scanRetentionByRole: async () => [],
      getActivation: async () => ({ spaces: 0, spacesWithSecondMember: 0, users: 0, usersWithPhoto: 0 }),
      scanVisitDays: async () => [],
      getActiveMix: async () => ({ newUsers: 0, existing: 0, resurrected: 0 }),
      scanRetentionCurve: async () => [],
    } as unknown as IOngiAdminRepository;

    expect((await new OngiAdminStatsUseCase(repository).execute()).excludedTestUsers).toBe(3);
  });
});
