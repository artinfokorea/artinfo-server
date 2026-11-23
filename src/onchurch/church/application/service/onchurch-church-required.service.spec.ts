import { OnchurchChurchRequiredService } from '@/onchurch/church/application/service/onchurch-church-required.service';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';

// 사이트 공개 필수 조건: 기본 정보(서브도메인·이름)와 연락처(전화·이메일·주소)만 필요하다.
// 담임목사·예배 안내는 메뉴에서 끌 수 있으므로 요구하지 않는다.
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

function makeService() {
  const churchRepository = { updatePublished: jest.fn(), findByOwnerId: jest.fn() };
  const service = new OnchurchChurchRequiredService(churchRepository as any);
  return { service, churchRepository };
}

describe('OnchurchChurchRequiredService.hasAllRequired', () => {
  it('담임목사·예배가 없어도 기본 정보·연락처만 있으면 true', async () => {
    const { service } = makeService();
    await expect(service.hasAllRequired(makeChurch())).resolves.toBe(true);
  });

  it('연락처(주소)가 비면 false', async () => {
    const { service } = makeService();
    await expect(service.hasAllRequired(makeChurch({ address: '' }))).resolves.toBe(false);
  });

  it('서브도메인이 비면 false', async () => {
    const { service } = makeService();
    await expect(service.hasAllRequired(makeChurch({ slug: ' ' }))).resolves.toBe(false);
  });

  it('필수 정보가 있으면 운영이 자동으로 꺼지지 않는다', async () => {
    const { service, churchRepository } = makeService();
    await service.autoUnpublishIfMissing(makeChurch());
    expect(churchRepository.updatePublished).not.toHaveBeenCalled();
  });

  it('운영 중인데 필수 정보를 잃으면 운영을 끈다', async () => {
    const { service, churchRepository } = makeService();
    await service.autoUnpublishIfMissing(makeChurch({ phone: '' }));
    expect(churchRepository.updatePublished).toHaveBeenCalledWith(10, false);
  });
});
