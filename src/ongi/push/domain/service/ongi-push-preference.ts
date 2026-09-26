/** 사용자가 끄고 켤 수 있는 푸시 종류 — 문의 답변·운영 알림은 여기 없고 항상 보낸다 */
export const ONGI_PUSH_CATEGORIES = ['photo', 'comment', 'like', 'event', 'family'] as const;
export type OngiPushCategory = (typeof ONGI_PUSH_CATEGORIES)[number];

/** 종류별 수신 여부 */
export type OngiPushPreferences = Record<OngiPushCategory, boolean>;

/** 가입 시 기본값 — 전부 켜짐. 저장된 행이 없는 사용자는 이 값으로 본다 */
export const DEFAULT_PUSH_PREFERENCES: OngiPushPreferences = Object.freeze({ photo: true, comment: true, like: true, event: true, family: true });

/** 이 사용자에게 이 종류의 푸시를 보내도 되는가. 카테고리가 없는 알림은 설정과 무관하게 허용 */
export function allowsPushCategory(preferences: OngiPushPreferences | null | undefined, category: OngiPushCategory | undefined): boolean {
  if (!category) return true;
  return (preferences ?? DEFAULT_PUSH_PREFERENCES)[category];
}

/** 일부 항목만 담긴 변경 요청을 현재 설정 위에 덮어쓴다 (undefined 는 무시) */
export function mergePushPreferences(current: OngiPushPreferences | null | undefined, patch: Partial<OngiPushPreferences>): OngiPushPreferences {
  const merged = { ...(current ?? DEFAULT_PUSH_PREFERENCES) };
  for (const category of ONGI_PUSH_CATEGORIES) {
    const value = patch[category];
    if (typeof value === 'boolean') merged[category] = value;
  }
  return merged;
}

/** 수신자 목록에서 그 종류를 끈 사용자를 뺀다 — 순서 유지, 설정이 없는 사용자는 기본값(켜짐) */
export function filterUserIdsByPreference(userIds: number[], saved: Map<number, OngiPushPreferences>, category: OngiPushCategory | undefined): number[] {
  if (!category) return userIds;
  return userIds.filter(userId => allowsPushCategory(saved.get(userId), category));
}
