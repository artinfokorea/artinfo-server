/** 앱 최소 버전 — 플랫폼·버전 문자열 규칙과 비교 */

export const APP_PLATFORMS = ['ios', 'android'] as const;
export type AppPlatform = (typeof APP_PLATFORMS)[number];

/** 기기별 스토어 링크 — 업데이트 안내 화면이 연다 */
export const STORE_URLS: Record<AppPlatform, string> = Object.freeze({
  ios: 'https://apps.apple.com/kr/app/id6831637981',
  android: 'https://play.google.com/store/apps/details?id=com.artinfokorea.app',
});

/** 숫자와 점만, 1~4마디: 1 · 1.1 · 1.2.3 · 1.2.3.4 */
export const VERSION_PATTERN = /^\d+(\.\d+){0,3}$/;

export const isAppPlatform = (value: unknown): value is AppPlatform => typeof value === 'string' && (APP_PLATFORMS as readonly string[]).includes(value);

export const isValidVersion = (value: unknown): value is string => typeof value === 'string' && VERSION_PATTERN.test(value.trim());

/** 마디별 숫자 비교. 빠진 마디는 0 (1.1 == 1.1.0). a<b → -1, 같으면 0, a>b → 1 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const pa = a.trim().split('.').map(Number);
  const pb = b.trim().split('.').map(Number);
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i += 1) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

/** 현재 버전이 최소 버전보다 낮으면 강제 업데이트 */
export const isUpdateRequired = (current: string, minVersion: string): boolean => compareVersions(current, minVersion) < 0;

/** 최신 버전이 정해져 있고 현재가 그보다 낮으면 선택 업데이트 안내 */
export const isUpdateAvailable = (current: string, latestVersion: string | null): boolean => !!latestVersion && compareVersions(current, latestVersion) < 0;
