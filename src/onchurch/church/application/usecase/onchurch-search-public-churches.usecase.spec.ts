import { OnchurchSearchPublicChurchesUseCase } from '@/onchurch/church/application/usecase/onchurch-search-public-churches.usecase';
import { IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

/**
 * 기대: 교회 이름 검색어는 앞뒤 공백을 떼고 찾는다. 검색어가 비어 있으면 DB 를 조회하지 않고 빈 목록.
 */
function build() {
  const calls: { keyword: string; limit: number }[] = [];
  const churchRepository = {
    searchPublishedByName: async (keyword: string, limit: number) => {
      calls.push({ keyword, limit });
      return [{ church: { id: 10, slug: 'eunseok', name: '은석교회' }, pastorName: '김목사' }];
    },
  } as unknown as IOnchurchChurchRepository;
  return { useCase: new OnchurchSearchPublicChurchesUseCase(churchRepository), calls };
}

describe('OnchurchSearchPublicChurchesUseCase', () => {
  it('검색어 앞뒤 공백을 떼고 최대 30곳까지 찾는다', async () => {
    const { useCase, calls } = build();
    const result = await useCase.execute('  은석 ');
    expect(calls).toEqual([{ keyword: '은석', limit: 30 }]);
    expect(result[0].pastorName).toBe('김목사');
  });

  it('검색어가 비어 있으면 조회하지 않고 빈 목록', async () => {
    const { useCase, calls } = build();
    expect(await useCase.execute('   ')).toEqual([]);
    expect(await useCase.execute(undefined)).toEqual([]);
    expect(calls).toEqual([]);
  });
});
