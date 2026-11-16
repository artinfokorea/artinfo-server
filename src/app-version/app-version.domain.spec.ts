import { compareVersions, isAppPlatform, isUpdateAvailable, isUpdateRequired, isValidVersion, STORE_URLS } from '@/app-version/app-version.domain';

/**
 * 기대값:
 * - 버전은 숫자·점, 1~4마디만 유효. "1.1 " 처럼 공백은 trim 후 판단.
 * - 비교는 마디별 숫자: 1.10 > 1.9, 1.1 == 1.1.0, 2 > 1.9.9.
 * - 현재 < 최소 → 강제 업데이트. 현재 < 최신(있을 때) → 선택 업데이트.
 */
describe('app-version.domain', () => {
  it('isAppPlatform — ios·android 만', () => {
    expect(isAppPlatform('ios')).toBe(true);
    expect(isAppPlatform('android')).toBe(true);
    expect(isAppPlatform('web')).toBe(false);
    expect(isAppPlatform(undefined)).toBe(false);
  });

  it('isValidVersion', () => {
    expect(isValidVersion('1')).toBe(true);
    expect(isValidVersion('1.1')).toBe(true);
    expect(isValidVersion('1.2.3')).toBe(true);
    expect(isValidVersion('1.2.3.4')).toBe(true);
    expect(isValidVersion(' 1.1 ')).toBe(true);
    expect(isValidVersion('1.2.3.4.5')).toBe(false);
    expect(isValidVersion('v1.0')).toBe(false);
    expect(isValidVersion('1.0-beta')).toBe(false);
    expect(isValidVersion('')).toBe(false);
    expect(isValidVersion(1.1)).toBe(false);
  });

  it('compareVersions — 마디별 숫자 비교', () => {
    expect(compareVersions('1.10', '1.9')).toBe(1);
    expect(compareVersions('1.9', '1.10')).toBe(-1);
    expect(compareVersions('1.1', '1.1.0')).toBe(0);
    expect(compareVersions('2', '1.9.9')).toBe(1);
    expect(compareVersions('1.0', '1.0')).toBe(0);
    expect(compareVersions('1.0.1', '1.0')).toBe(1);
  });

  it('isUpdateRequired / isUpdateAvailable', () => {
    expect(isUpdateRequired('1.0', '1.1')).toBe(true);
    expect(isUpdateRequired('1.1', '1.1')).toBe(false);
    expect(isUpdateRequired('1.2', '1.1')).toBe(false);
    expect(isUpdateAvailable('1.1', '1.2')).toBe(true);
    expect(isUpdateAvailable('1.2', '1.2')).toBe(false);
    expect(isUpdateAvailable('1.0', null)).toBe(false);
  });

  it('STORE_URLS — 스토어 링크', () => {
    expect(STORE_URLS.ios).toBe('https://apps.apple.com/kr/app/id6831637981');
    expect(STORE_URLS.android).toBe('https://play.google.com/store/apps/details?id=com.artinfokorea.app');
  });
});
