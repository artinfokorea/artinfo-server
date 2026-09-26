import { OngiPushPreferences } from '@/ongi/push/domain/service/ongi-push-preference';

export const ONGI_PUSH_PREFERENCE_REPOSITORY = Symbol('ONGI_PUSH_PREFERENCE_REPOSITORY');

export interface IOngiPushPreferenceRepository {
  /** 저장한 적 없으면 null (호출 쪽이 기본값으로 본다) */
  findByUserId(userId: number): Promise<OngiPushPreferences | null>;
  /** 저장된 사용자만 담긴 Map — 없는 사용자는 기본값 */
  scanByUserIds(userIds: number[]): Promise<Map<number, OngiPushPreferences>>;
  save(userId: number, preferences: OngiPushPreferences): Promise<void>;
  deleteByUserId(userId: number): Promise<void>;
}
