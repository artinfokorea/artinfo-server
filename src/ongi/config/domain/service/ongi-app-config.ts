export type OngiAppPlatform = 'ios' | 'android';

export interface OngiAppConfig {
  platform: OngiAppPlatform;
  /** 요청한 플랫폼의 최소 지원 버전 — 미만이면 강제 업데이트 */
  minVersion: string;
  latestVersion: string;
  /**
   * (구버전 호환) 초기 앱은 플랫폼 구분 없이 이 필드로 게이트를 걸었다 — 안드로이드 요청이면 안드로이드 값을 담는다.
   * iOS·안드로이드 모두 minVersion 을 읽는 버전이 최소 버전이 되면 삭제
   */
  minIosVersion: string;
  latestIosVersion: string;
  /** 요청한 플랫폼의 스토어 링크 */
  storeUrl: string;
}

const STORE_URL: Record<OngiAppPlatform, string> = {
  ios: 'https://apps.apple.com/app/id6805759281',
  android: 'https://play.google.com/store/apps/details?id=com.ongifamily.app',
};

/**
 * 새 앱은 ?platform= 을 보낸다. 쿼리가 없는 구버전 앱은 User-Agent 로 구분한다
 * (React Native fetch — 안드로이드는 okhttp, iOS 는 CFNetwork). 판별 불가면 기존 동작대로 iOS.
 */
export function detectAppPlatform(platformQuery: string | undefined, userAgent: string | undefined): OngiAppPlatform {
  if (platformQuery === 'ios' || platformQuery === 'android') return platformQuery;
  if (userAgent && /okhttp|android/i.test(userAgent)) return 'android';

  return 'ios';
}

/** ongi_configs 키-값에서 플랫폼별 설정을 만든다 — 키가 없으면 1.0.0 (게이트 미적용) */
export function buildAppConfig(platform: OngiAppPlatform, byKey: Map<string, string>): OngiAppConfig {
  const minVersion = byKey.get(`min_${platform}_version`) ?? '1.0.0';
  const latestVersion = byKey.get(`latest_${platform}_version`) ?? '1.0.0';

  return {
    platform,
    minVersion,
    latestVersion,
    minIosVersion: minVersion,
    latestIosVersion: latestVersion,
    storeUrl: STORE_URL[platform],
  };
}
