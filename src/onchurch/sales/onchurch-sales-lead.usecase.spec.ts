import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OnchurchSalesLeadUseCase } from '@/onchurch/sales/onchurch-sales-lead.usecase';

/**
 * 마스터 영업 대상 DB
 * 기대:
 * - 마스터가 아니면 모든 기능 403
 * - 붙여넣기 가져오기: 이름 없는 줄은 invalid, DB 에 이미 있거나 같은 묶음 안에서 겹치는 교회는 skipped, 나머지만 저장
 * - 한 건 추가할 때 이미 있는 교회면 409
 * - 상태를 new 가 아닌 값으로 바꾸면 마지막 연락일을 기록, 같은 상태면 그대로
 * - 없는 id 수정은 404
 */
function build(role = 'master') {
  const userRepository = { findOneOrThrowById: jest.fn().mockResolvedValue({ id: 1, role }) };
  const existing = { id: 7, name: '사랑교회', phone: '031-123-4567', address: null, status: 'new' };
  const repository = {
    search: jest.fn().mockResolvedValue({ items: [], total: 0, counts: {} }),
    findByNames: jest.fn().mockResolvedValue([existing]),
    insertMany: jest.fn(async (rows: unknown[]) => rows.length),
    findById: jest.fn(async (id: number) => (id === 7 ? existing : null)),
    update: jest.fn(async (id: number) => ({ ...existing, id })),
    softDelete: jest.fn(async (ids: number[]) => ids.length),
  };
  const useCase = new OnchurchSalesLeadUseCase(userRepository as any, repository as any);
  return { useCase, repository };
}

const base = {
  denomination: null,
  region: null,
  address: null,
  pastor: null,
  email: null,
  homepageStatus: 'unknown',
  homepageUrl: null,
  source: null,
  status: 'new',
  emailConsent: false,
  memo: null,
};

describe('OnchurchSalesLeadUseCase', () => {
  it('마스터가 아니면 403', async () => {
    const { useCase } = build('owner');
    await expect(useCase.search(1, { page: 1, size: 50 })).rejects.toThrow(ForbiddenException);
    await expect(useCase.importRows(1, [{ name: 'a' }])).rejects.toThrow(ForbiddenException);
    await expect(useCase.remove(1, [1])).rejects.toThrow(ForbiddenException);
  });

  it('가져오기: 이름 없음은 invalid, 이미 있거나 겹치면 skipped', async () => {
    const { useCase, repository } = build();
    const result = await useCase.importRows(1, [
      { name: '사랑교회', phone: '0311234567' }, // DB 에 있음
      { name: '소망교회', phone: '02-111-2222' },
      { name: '소망 교회', phone: '021112222' }, // 위와 겹침
      { name: '' },
      { name: '믿음교회', homepageStatus: '없음', email: 'Faith@Naver.com' },
    ]);
    expect(result).toEqual({ created: 2, skipped: 2, invalid: 1 });
    expect(repository.findByNames).toHaveBeenCalledWith(['사랑교회', '소망교회', '믿음교회']);
    expect(repository.insertMany).toHaveBeenCalledWith([
      { ...base, name: '소망교회', phone: '02-111-2222' },
      { ...base, name: '믿음교회', phone: null, email: 'faith@naver.com', homepageStatus: 'none' },
    ]);
  });

  it('한 건 추가: 이미 있으면 409', async () => {
    const { useCase } = build();
    await expect(useCase.create(1, { name: '사랑교회', phone: '031-123-4567' })).rejects.toThrow(ConflictException);
  });

  it('상태가 바뀌면 마지막 연락일 기록', async () => {
    const { useCase, repository } = build();
    await useCase.update(1, 7, { name: '사랑교회', phone: '031-123-4567', status: 'contacted' });
    expect(repository.update).toHaveBeenCalledWith(7, { ...base, name: '사랑교회', phone: '031-123-4567', status: 'contacted' }, true);
    await useCase.update(1, 7, { name: '사랑교회', phone: '031-123-4567', status: 'new' });
    expect(repository.update).toHaveBeenLastCalledWith(7, { ...base, name: '사랑교회', phone: '031-123-4567', status: 'new' }, false);
  });

  it('없는 id 수정은 404', async () => {
    await expect(build().useCase.update(1, 99, { name: 'x' })).rejects.toThrow(NotFoundException);
  });
});
