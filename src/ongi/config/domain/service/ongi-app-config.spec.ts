import { buildAppConfig, detectAppPlatform } from '@/ongi/config/domain/service/ongi-app-config';

const IOS_UA = 'ongi/12 CFNetwork/3826.500.131 Darwin/25.0.0';
const ANDROID_UA = 'okhttp/4.12.0';

describe('detectAppPlatform — 요청한 앱의 플랫폼', () => {
  it('platform 쿼리가 있으면 그대로 따른다', () => {
    expect(detectAppPlatform('android', IOS_UA)).toBe('android');
    expect(detectAppPlatform('ios', ANDROID_UA)).toBe('ios');
  });

  it('쿼리가 없는 구버전 앱: okhttp User-Agent 는 안드로이드', () => {
    expect(detectAppPlatform(undefined, ANDROID_UA)).toBe('android');
  });

  it('쿼리가 없는 구버전 앱: iOS(CFNetwork) User-Agent 는 iOS', () => {
    expect(detectAppPlatform(undefined, IOS_UA)).toBe('ios');
  });

  it('User-Agent 에 Android 가 들어 있어도 안드로이드', () => {
    expect(detectAppPlatform(undefined, 'Mozilla/5.0 (Linux; Android 14)')).toBe('android');
  });

  it('판별할 수 없으면 iOS — 기존 동작 유지', () => {
    expect(detectAppPlatform(undefined, undefined)).toBe('ios');
    expect(detectAppPlatform('windows', undefined)).toBe('ios');
  });
});

describe('buildAppConfig — 플랫폼별 최소/최신 버전', () => {
  const rows = new Map([
    ['min_ios_version', '1.0.6'],
    ['latest_ios_version', '1.0.7'],
    ['min_android_version', '1.0.2'],
    ['latest_android_version', '1.0.3'],
  ]);

  it('iOS 는 iOS 값과 App Store 링크', () => {
    expect(buildAppConfig('ios', rows)).toEqual({
      platform: 'ios',
      minVersion: '1.0.6',
      latestVersion: '1.0.7',
      minIosVersion: '1.0.6',
      latestIosVersion: '1.0.7',
      storeUrl: 'https://apps.apple.com/app/id6805759281',
    });
  });

  it('안드로이드는 안드로이드 값과 Play 스토어 링크 — 구버전 안드로이드 앱이 읽는 minIosVersion·storeUrl 도 안드로이드 값', () => {
    expect(buildAppConfig('android', rows)).toEqual({
      platform: 'android',
      minVersion: '1.0.2',
      latestVersion: '1.0.3',
      minIosVersion: '1.0.2',
      latestIosVersion: '1.0.3',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.ongifamily.app',
    });
  });

  it('키가 없으면 1.0.0 — 강제 업데이트가 걸리지 않는다', () => {
    expect(buildAppConfig('android', new Map())).toEqual({
      platform: 'android',
      minVersion: '1.0.0',
      latestVersion: '1.0.0',
      minIosVersion: '1.0.0',
      latestIosVersion: '1.0.0',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.ongifamily.app',
    });
  });
});
