import { AppVersionService } from '@/app-version/app-version.service';
import { AppVersionRepository } from '@/app-version/app-version.repository';
import { AppPlatformInvalid, AppVersionInvalid, AppVersionNotConfigured } from '@/app-version/app-version.exception';

/**
 * 기대값:
 * - check('ios','1.0') with min 1.1, latest 1.2 → updateRequired true, updateAvailable true, storeUrl App Store.
 * - check('android','1.2') with min 1.1, latest null → updateRequired false, updateAvailable null.
 * - check 에 version 을 안 보내면 둘 다 null. platform 이 틀리면 400, version 형식이 틀리면 400, 설정 행이 없으면 404.
 * - save: 공백 trim, 빈 latest/message 는 null, 형식 오류 400, 저장 후 전체 목록을 돌려준다.
 */
describe('AppVersionService', () => {
  const repository = { findByPlatform: jest.fn(), findAll: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
  const service = new AppVersionService(repository as unknown as AppVersionRepository);
  const updatedAt = new Date('2026-11-16T00:00:00Z');
  const ios = { platform: 'ios', minVersion: '1.1', latestVersion: '1.2', message: '새 기능', updatedBy: 1, updatedAt };
  const android = { platform: 'android', minVersion: '1.1', latestVersion: null, message: null, updatedBy: null, updatedAt };

  beforeEach(() => jest.clearAllMocks());

  it('check — 낮은 버전이면 강제·선택 업데이트 모두 true', async () => {
    repository.findByPlatform.mockResolvedValue(ios);
    await expect(service.check('ios', '1.0')).resolves.toEqual({
      platform: 'ios',
      minVersion: '1.1',
      latestVersion: '1.2',
      storeUrl: 'https://apps.apple.com/kr/app/id6831637981',
      message: '새 기능',
      updateRequired: true,
      updateAvailable: true,
    });
  });

  it('check — 최소 이상이면 false, 최신 미설정이면 updateAvailable null', async () => {
    repository.findByPlatform.mockResolvedValue(android);
    const result = await service.check('android', '1.2');
    expect(result.updateRequired).toBe(false);
    expect(result.updateAvailable).toBeNull();
    expect(result.storeUrl).toBe('https://play.google.com/store/apps/details?id=com.artinfokorea.app');
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

  it('save — trim·빈 값 null 로 저장하고 전체 목록을 돌려준다', async () => {
    repository.findAll.mockResolvedValue([android, ios]);
    const result = await service.save('ios', { minVersion: ' 1.2 ', latestVersion: '', message: '  ' }, 9);
    expect(repository.save).toHaveBeenCalledWith('ios', { minVersion: '1.2', latestVersion: null, message: null }, 9);
    expect(result.versions.map(v => v.platform)).toEqual(['android', 'ios']);
  });

  it('save — 형식·플랫폼 오류는 400 이고 저장하지 않는다', async () => {
    await expect(service.save('ios', { minVersion: '1.0-beta' }, 9)).rejects.toBeInstanceOf(AppVersionInvalid);
    await expect(service.save('ios', { minVersion: '1.0', latestVersion: 'latest' }, 9)).rejects.toBeInstanceOf(AppVersionInvalid);
    await expect(service.save('web', { minVersion: '1.0' }, 9)).rejects.toBeInstanceOf(AppPlatformInvalid);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
