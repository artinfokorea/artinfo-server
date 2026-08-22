import { OngiNotification, OngiNotificationCreator } from '@/ongi/notification/domain/entity/ongi-notification.entity';

export const ONGI_NOTIFICATION_REPOSITORY = Symbol('ONGI_NOTIFICATION_REPOSITORY');

export interface IOngiNotificationRepository {
  createMany(creators: OngiNotificationCreator[]): Promise<void>;
  scanByRecipientUserId(userId: number, limit: number): Promise<OngiNotification[]>;
  markAllRead(userId: number): Promise<void>;
}
