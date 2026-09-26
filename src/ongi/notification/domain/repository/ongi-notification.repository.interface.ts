import { OngiNotification } from '@/ongi/notification/domain/entity/ongi-notification.entity';
import { OngiNotificationCreator } from '@/ongi/notification/domain/service/ongi-notification';

export const ONGI_NOTIFICATION_REPOSITORY = Symbol('ONGI_NOTIFICATION_REPOSITORY');

export interface IOngiNotificationRepository {
  createMany(records: OngiNotificationCreator[]): Promise<void>;
  /** since 이후 것만, 최근 순, 최대 limit */
  scanByUserId(userId: number, since: Date, limit: number): Promise<OngiNotification[]>;
  /** since 이후이면서 after(마지막으로 본 시각) 뒤에 생긴 개수 — after 가 null 이면 since 이후 전부 */
  countUnseen(userId: number, since: Date, after: Date | null): Promise<number>;
  findSeenAt(userId: number): Promise<Date | null>;
  markSeen(userId: number, seenAt: Date): Promise<void>;
  deleteOlderThan(cutoff: Date): Promise<number>;
  deleteByUserId(userId: number): Promise<void>;
}
