import { OnchurchChurchRequiredService } from '@/onchurch/church/application/service/onchurch-church-required.service';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';

// 사이트 공개 필수 조건: 모든 교회는 기본 정보(서브도메인·이름)와 연락처(전화·이메일·주소)가 필요하다.
// 기존 교회는 담임목사 이름과 예배 1개 이상도 필요하지만, 테스트 교회(소유자 is_test)는
// 교회 소개·예배 안내를 메뉴에서 끌 수 있으므로 이 둘을 요구하지 않는다.
function makeChurch(overrides: Partial<OnchurchChurch> = {}): OnchurchChurch {
  return Object.assign(new OnchurchChurch(), {
    id: 1,
    ownerId: 10,
    slug: 'grace',
    name: '은혜교회',
    phone: '02-123-4567',
    email: 'a@b.kr',
    address: '서울',
    isPublished: true,
    ...overrides,
  });
}

function makeService(opts: { isTest: boolean; pastorName: string | null; worshipCount: number }) {
  const churchRepository = { updatePublished: jest.fn(), findByOwnerId: jest.fn() };
  const pastorRepository = { findOneBy: jest.fn().mockResolvedValue(opts.pastorName === null ? null : { name: opts.pastorName }) };
  const worshipRepository = { count: jest.fn().mockResolvedValue(opts.worshipCount) };
  const userRepository = { findOneOrThrowById: jest.fn().mockResolvedValue({ id: 10, isTest: opts.isTest }) };
  const service = new OnchurchChurchRequiredService(churchRepository as any, pastorRepository as any, worshipRepository as any, userRepository as any);
  return { service, churchRepository };
}

describe('OnchurchChurchRequiredService.hasAllRequired', () => {
  it('기존 교회: 담임목사·예배가 없으면 false', async () => {
    const { service } = makeService({ isTest: false, pastorName: null, worshipCount: 0 });
    await expect(service.hasAllRequired(makeChurch())).resolves.toBe(false);
  });

  it('기존 교회: 기본 정보·연락처·담임목사·예배가 모두 있으면 true', async () => {
    const { service } = makeService({ isTest: false, pastorName: '홍길동', worshipCount: 1 });
    await expect(service.hasAllRequired(makeChurch())).resolves.toBe(true);
  });

  it('테스트 교회: 담임목사·예배가 없어도 기본 정보·연락처만 있으면 true', async () => {
    const { service } = makeService({ isTest: true, pastorName: null, worshipCount: 0 });
    await expect(service.hasAllRequired(makeChurch())).resolves.toBe(true);
  });

  it('테스트 교회: 연락처(주소)가 비면 false', async () => {
    const { service } = makeService({ isTest: true, pastorName: '홍길동', worshipCount: 1 });
    await expect(service.hasAllRequired(makeChurch({ address: '' }))).resolves.toBe(false);
  });

  it('테스트 교회: 예배를 모두 지워도 운영이 자동으로 꺼지지 않는다', async () => {
    const { service, churchRepository } = makeService({ isTest: true, pastorName: null, worshipCount: 0 });
    await service.autoUnpublishIfMissing(makeChurch());
    expect(churchRepository.updatePublished).not.toHaveBeenCalled();
  });
});
