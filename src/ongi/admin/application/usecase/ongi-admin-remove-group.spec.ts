import { OngiAdminDirectoryUseCase, OngiAdminMeUseCase } from '@/ongi/admin/application/usecase/ongi-admin.usecase';
import { IOngiAdminRepository, OngiAdminGroupRow } from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';
import { OngiAdminNotFound } from '@/ongi/admin/domain/exception/ongi-admin.exception';

const GROUP: OngiAdminGroupRow = {
  id: 12,
  name: '우리 가족',
  createdAt: new Date('2026-09-01T00:00:00Z'),
  memberCount: 4,
  photoCount: 120,
  lastPhotoAt: new Date('2026-09-20T00:00:00Z'),
};

function fakeRepository(group: OngiAdminGroupRow | null) {
  const removed: { groupId: number; adminUserId: number }[] = [];
  const repository = {
    findGroupById: async () => group,
    softDeleteGroup: async (groupId: number, adminUserId: number) => {
      removed.push({ groupId, adminUserId });
    },
  } as unknown as IOngiAdminRepository;

  return { repository, removed };
}

describe('OngiAdminDirectoryUseCase.removeGroup — 관리자 화면에서 가족 공간 삭제', () => {
  it('공간과 딸린 데이터를 소프트 삭제하고, 누가 지웠는지 함께 넘긴다', async () => {
    const { repository, removed } = fakeRepository(GROUP);

    await new OngiAdminDirectoryUseCase(repository).removeGroup({ userId: 7, type: 'SUPER_ADMIN' }, 12);

    expect(removed).toEqual([{ groupId: 12, adminUserId: 7 }]);
  });

  it('없거나 이미 삭제된 공간이면 찾을 수 없음 — 아무것도 지우지 않는다', async () => {
    const { repository, removed } = fakeRepository(null);

    await expect(new OngiAdminDirectoryUseCase(repository).removeGroup({ userId: 7, type: 'SUPER_ADMIN' }, 12)).rejects.toBeInstanceOf(OngiAdminNotFound);
    expect(removed).toEqual([]);
  });
});

describe('OngiAdminMeUseCase — 화면에 내려주는 권한 목록', () => {
  const repository = { findUserTypeById: async () => ({ id: 7, name: '조엘', type: 'SUPER_ADMIN', deletedAt: null }) } as unknown as IOngiAdminRepository;

  it('SUPER_ADMIN 에게는 가족 공간 삭제 권한이 포함된다', async () => {
    const me = await new OngiAdminMeUseCase(repository).execute({ userId: 7, type: 'SUPER_ADMIN' });

    expect(me.permissions).toEqual(['dashboard', 'reports', 'inquiries', 'directory', 'configs', 'grant', 'sensitive', 'photos', 'deleteGroup']);
  });

  it('ADMIN 에게는 없다', async () => {
    const me = await new OngiAdminMeUseCase(repository).execute({ userId: 7, type: 'ADMIN' });

    expect(me.permissions).toEqual(['dashboard', 'reports', 'inquiries', 'directory']);
  });
});
