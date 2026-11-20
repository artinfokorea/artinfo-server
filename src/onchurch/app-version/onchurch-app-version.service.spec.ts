import { ForbiddenException } from '@nestjs/common';
import { OnchurchAppVersionService } from '@/onchurch/app-version/onchurch-app-version.service';
import { OnchurchAppVersionRepository } from '@/onchurch/app-version/onchurch-app-version.repository';
import { IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { AppPlatformInvalid, AppVersionInvalid, AppVersionNotConfigured } from '@/app-version/app-version.exception';
import { OnchurchAppStoreUrlInvalid } from '@/onchurch/app-version/onchurch-app-version.exception';

/**
 * 사용자: 1 마스터 · 2 교회 관리자(owner)
 * 설정: ios 최소 1.1 / 최신 1.2 / 스토어 주소 등록됨 · android 최소 1.1 / 최신 없음 / 스토어 주소 없음
 * 기대값:
 * - 앱 1.0(ios) → 강제 업데이트 true, 선택 업데이트 true, 스토어 주소는 등록된 값 그대로.
 * - 앱 1.2(android) → 강제 false, 최신 미설정이라 선택 null, 스토어 주소가 없으면 패키지명으로 만든 Play 주소.
 * - version 을 안 보내면 판정은 null. platform·version 형식 오류는 400, 설정 행이 없으면 404.
 * - 저장은 마스터만(그 외 403). 공백은 떼고 빈 값은 null. 버전 형식·스토어 주소(https 아님) 오류는 400 이고 저장하지 않는다.
 */
describe('OnchurchAppVersionService', () => {
  const repository = { findByPlatform: jest.fn(), findAll: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
  const userRepository = {
    findOneOrThrowById: async (id: number) => ({ id, role: id === 1 ? 'master' : 'owner' }),
  } as unknown as IOnchurchUserRepository;
  const service = new OnchurchAppVersionService(repository as unknown as OnchurchAppVersionRepository, userRepository);
  const updatedAt = new Date('2026-11-20T00:00:00Z');
  const ios = {
    platform: 'ios',
    minVersion: '1.1',
    latestVersion: '1.2',
    message: '새 기능',
    storeUrl: 'https://apps.apple.com/kr/app/id123456789',
    updatedBy: 1,
    updatedAt,
  };
  const android = { platform: 'android', minVersion: '1.1', latestVersion: null, message: null, storeUrl: null, updatedBy: null, updatedAt };

  beforeEach(() => jest.clearAllMocks());

  it('check — 낮은 버전이면 강제·선택 업데이트 모두 true', async () => {
    repository.findByPlatform.mockResolvedValue(ios);
    await expect(service.check('ios', '1.0')).resolves.toEqual({
      platform: 'ios',
      minVersion: '1.1',
      latestVersion: '1.2',
      storeUrl: 'https://apps.apple.com/kr/app/id123456789',
      message: '새 기능',
      updateRequired: true,
      updateAvailable: true,
    });
  });

  it('check — 최소 이상이면 false, 최신 미설정이면 선택 업데이트 null, 스토어 주소가 없으면 기본 Play 주소', async () => {
    repository.findByPlatform.mockResolvedValue(android);
    const result = await service.check('android', '1.2');
    expect(result.updateRequired).toBe(false);
    expect(result.updateAvailable).toBeNull();
    expect(result.storeUrl).toBe('https://play.google.com/store/apps/details?id=kr.co.everychurch.app');
  });

  it('check — iOS 스토어 주소가 아직 없으면 null', async () => {
    repository.findByPlatform.mockResolvedValue({ ...ios, storeUrl: null });
    expect((await service.check('ios', '1.2')).storeUrl).toBeNull();
  });

  it('check — version 없으면 판정은 null, 설정값만 준다', async () => {
    repository.findByPlatform.mockResolvedValue(ios);
    const result = await service.check('ios', undefined);
    expect(result.updateRequired).toBeNull();
    expect(result.updateAvailable).toBeNull();
    expect(result.minVersion).toBe('1.1');
  });

  it('check — 잘못된 platform·version 은 400, 설정 없음은 404', async () => {
    await expect(service.check('web', '1.0')).rejects.toBeInstanceOf(AppPlatformInvalid);
    await expect(service.check('ios', 'v1')).rejects.toBeInstanceOf(AppVersionInvalid);
    repository.findByPlatform.mockResolvedValue(null);
    await expect(service.check('ios', '1.0')).rejects.toBeInstanceOf(AppVersionNotConfigured);
  });

  it('list — 마스터가 아니면 403', async () => {
    repository.findAll.mockResolvedValue([android, ios]);
    await expect(service.listForMaster(2)).rejects.toBeInstanceOf(ForbiddenException);
    expect((await service.listForMaster(1)).versions.map(v => v.platform)).toEqual(['android', 'ios']);
  });

  it('save — trim·빈 값 null 로 저장하고 전체 목록을 돌려준다', async () => {
    repository.findAll.mockResolvedValue([android, ios]);
    const result = await service.save(1, 'ios', {
      minVersion: ' 1.2 ',
      latestVersion: '',
      message: '  ',
      storeUrl: ' https://apps.apple.com/kr/app/id123456789 ',
    });
    expect(repository.save).toHaveBeenCalledWith(
      'ios',
      { minVersion: '1.2', latestVersion: null, message: null, storeUrl: 'https://apps.apple.com/kr/app/id123456789' },
      1,
    );
    expect(result.versions.map(v => v.platform)).toEqual(['android', 'ios']);
  });

  it('save — 마스터가 아니면 403 이고 저장하지 않는다', async () => {
    await expect(service.save(2, 'ios', { minVersion: '1.2' })).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('save — 형식·플랫폼·스토어 주소 오류는 400 이고 저장하지 않는다', async () => {
    await expect(service.save(1, 'ios', { minVersion: '1.0-beta' })).rejects.toBeInstanceOf(AppVersionInvalid);
    await expect(service.save(1, 'ios', { minVersion: '1.0', latestVersion: 'latest' })).rejects.toBeInstanceOf(AppVersionInvalid);
    await expect(service.save(1, 'web', { minVersion: '1.0' })).rejects.toBeInstanceOf(AppPlatformInvalid);
    await expect(service.save(1, 'ios', { minVersion: '1.0', storeUrl: 'javascript:alert(1)' })).rejects.toBeInstanceOf(OnchurchAppStoreUrlInvalid);
    await expect(service.save(1, 'ios', { minVersion: '1.0', storeUrl: 'http://apps.apple.com/app' })).rejects.toBeInstanceOf(OnchurchAppStoreUrlInvalid);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
