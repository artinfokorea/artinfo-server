import { OnchurchGetPublicChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-get-public-church.usecase';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchChurchNotFound } from '@/onchurch/church/domain/exception/onchurch-church.exception';

// 공개 사이트 조회: 교회와 함께 소유자가 테스트 계정인지(ownerIsTest)를 돌려준다.
// 웹은 이 값으로 테스트 교회에만 시험 기능(앱 다운로드 버튼 등)을 보여준다.
function makeUseCase(church: Partial<OnchurchChurch> | null, owner: { isTest: boolean } | Error) {
  const churchRepository = { findPublishedBySlug: jest.fn().mockResolvedValue(church ? Object.assign(new OnchurchChurch(), church) : null) };
  const userRepository = {
    findOneOrThrowById: owner instanceof Error ? jest.fn().mockRejectedValue(owner) : jest.fn().mockResolvedValue(owner),
  };
  return new OnchurchGetPublicChurchUseCase(churchRepository as any, userRepository as any);
}

describe('OnchurchGetPublicChurchUseCase.executeWithOwner', () => {
  it('소유자가 테스트 계정이면 ownerIsTest=true', async () => {
    const result = await makeUseCase({ id: 1, ownerId: 10, slug: 'grace' }, { isTest: true }).executeWithOwner('grace');
    expect(result.church.slug).toBe('grace');
    expect(result.ownerIsTest).toBe(true);
  });

  it('일반 계정이면 ownerIsTest=false', async () => {
    const result = await makeUseCase({ id: 1, ownerId: 10, slug: 'grace' }, { isTest: false }).executeWithOwner('grace');
    expect(result.ownerIsTest).toBe(false);
  });

  it('소유자 조회가 실패해도 공개 페이지는 열리고 ownerIsTest=false', async () => {
    const result = await makeUseCase({ id: 1, ownerId: 10, slug: 'grace' }, new Error('not found')).executeWithOwner('grace');
    expect(result.ownerIsTest).toBe(false);
  });

  it('공개 중인 교회가 없으면 NotFound', async () => {
    await expect(makeUseCase(null, { isTest: true }).executeWithOwner('none')).rejects.toBeInstanceOf(OnchurchChurchNotFound);
  });
});
