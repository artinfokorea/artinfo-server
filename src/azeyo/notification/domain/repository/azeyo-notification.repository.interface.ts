import { AzeyoNotification } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';

export const AZEYO_NOTIFICATION_REPOSITORY = Symbol('AZEYO_NOTIFICATION_REPOSITORY');

export interface IAzeyoNotificationRepository {
  create(notification: Partial<AzeyoNotification>): Promise<AzeyoNotification>;
  findManyByUserId(userId: number, skip: number, take: number): Promise<{ items: AzeyoNotification[]; totalCount: number }>;
  countUnreadByUserId(userId: number): Promise<number>;
  markAsRead(id: number, userId: number): Promise<void>;
  markAllAsRead(userId: number): Promise<void>;
}
