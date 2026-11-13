import { AdminUsersService } from '@/admin/admin-users.service';
import { AdminUsersRepository } from '@/admin/repository/admin-users.repository';
import { USER_TYPE } from '@/user/entity/user.entity';
import { AdminSelfActionForbidden, AdminTargetIsAdmin, AdminUserNotFound } from '@/admin/domain/artinfo-admin.exception';

/**
 * 기대값: 회원 관리 서비스
 * - list: 필터·검색어·page·size 를 정리해 저장소에 넘기고, total/page/size/totalPages/users 를 돌려준다. 이메일·전화는 마스킹.
 * - list: page 0 → 1, size 1000 → 100, 모르는 필터 → all, 빈 검색어 → null.
 * - changeType: 자기 자신이면 400, 없는 회원이면 404, 아니면 updateType.
 * - withdraw: 관리자 대상이면 400, 아니면 withdraw.
 */
describe('AdminUsersService', () => {
  const repository = {
    summary: jest.fn(),
    findUsers: jest.fn(),
    findTarget: jest.fn(),
    updateType: jest.fn().mockResolvedValue(undefined),
    withdraw: jest.fn().mockResolvedValue(undefined),
  };
  const service = new AdminUsersService(repository as unknown as AdminUsersRepository);
  const row = {
    id: 5,
    type: 'CLIENT',
    name: '홍길동',
    nickname: '길동',
    email: 'gildong@example.com',
    phone: '010-1234-5678',
    createdAt: new Date('2026-10-01T00:00:00Z'),
    deletedAt: null,
    lastLoginAt: new Date('2026-11-10T00:00:00Z'),
    loginTypes: ['KAKAO'],
    deviceCount: 2,
    platforms: ['ios', 'android'],
    appInstalledAt: new Date('2026-10-02T00:00:00Z'),
    pushJob: false,
  };

  beforeEach(() => jest.clearAllMocks());

  it('summary — 저장소 행을 camelCase 응답으로 바꾼다', async () => {
    repository.summary.mockResolvedValue({
      members: 120,
      members_7d: 4,
      admins: 2,
      withdrawn: 9,
      app_users: 30,
      app_users_7d: 3,
      app_users_ios: 25,
      app_users_android: 7,
      push_on: 28,
      push_off: 2,
      devices: 33,
    });
    await expect(service.summary()).resolves.toEqual({
      members: 120,
      membersLast7d: 4,
      admins: 2,
      withdrawn: 9,
      appUsers: 30,
      appUsersLast7d: 3,
      appUsersIos: 25,
      appUsersAndroid: 7,
      pushOn: 28,
      pushOff: 2,
      devices: 33,
    });
  });

  it('list — 입력을 정리해 넘기고 페이지 정보를 계산한다', async () => {
    repository.findUsers.mockResolvedValue({ total: 41, rows: [row] });
    const result = await service.list({ filter: 'push_off', query: '  길동 ', page: 2, size: 20 });
    expect(repository.findUsers).toHaveBeenCalledWith('push_off', '길동', 2, 20);
    expect(result.total).toBe(41);
    expect(result.page).toBe(2);
    expect(result.size).toBe(20);
    expect(result.totalPages).toBe(3);
    expect(result.filter).toBe('push_off');
    expect(result.query).toBe('길동');
    expect(result.users).toEqual([
      {
        id: 5,
        type: 'CLIENT',
        name: '홍길동',
        nickname: '길동',
        email: 'gi***@example.com',
        phone: '010-****-5678',
        createdAt: row.createdAt,
        deletedAt: null,
        lastLoginAt: row.lastLoginAt,
        loginTypes: ['KAKAO'],
        hasApp: true,
        deviceCount: 2,
        platforms: ['ios', 'android'],
        appInstalledAt: row.appInstalledAt,
        pushJob: false,
      },
    ]);
  });

  it('list — 잘못된 값은 기본값으로 (page 0→1, size 1000→100, 모르는 필터→all, 빈 검색어→null), 결과 없으면 totalPages 1', async () => {
    repository.findUsers.mockResolvedValue({ total: 0, rows: [] });
    const result = await service.list({ filter: 'zzz', query: '   ', page: 0, size: 1000 });
    expect(repository.findUsers).toHaveBeenCalledWith('all', null, 1, 100);
    expect(result.totalPages).toBe(1);
    expect(result.users).toEqual([]);
  });

  it('changeType — 다른 회원이면 바꾸고, 자기 자신이면 거절, 없는 회원이면 404', async () => {
    repository.findTarget.mockResolvedValue({ id: 5, type: 'CLIENT', deletedAt: null });
    await service.changeType(1, 5, USER_TYPE.ADMIN);
    expect(repository.updateType).toHaveBeenCalledWith(5, 'ADMIN');

    repository.findTarget.mockResolvedValue({ id: 1, type: 'ADMIN', deletedAt: null });
    await expect(service.changeType(1, 1, USER_TYPE.CLIENT)).rejects.toBeInstanceOf(AdminSelfActionForbidden);

    repository.findTarget.mockResolvedValue(null);
    await expect(service.changeType(1, 99, USER_TYPE.ADMIN)).rejects.toBeInstanceOf(AdminUserNotFound);
    expect(repository.updateType).toHaveBeenCalledTimes(1);
  });

  it('withdraw — 일반 회원은 탈퇴 처리, 관리자는 거절', async () => {
    repository.findTarget.mockResolvedValue({ id: 5, type: 'CLIENT', deletedAt: null });
    await service.withdraw(1, 5);
    expect(repository.withdraw).toHaveBeenCalledWith(5);

    repository.findTarget.mockResolvedValue({ id: 6, type: 'ADMIN', deletedAt: null });
    await expect(service.withdraw(1, 6)).rejects.toBeInstanceOf(AdminTargetIsAdmin);
    expect(repository.withdraw).toHaveBeenCalledTimes(1);
  });
});
