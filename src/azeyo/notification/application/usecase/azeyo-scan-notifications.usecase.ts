import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_NOTIFICATION_REPOSITORY, IAzeyoNotificationRepository } from '@/azeyo/notification/domain/repository/azeyo-notification.repository.interface';
import { AzeyoNotification } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';

@Injectable()
export class AzeyoScanNotificationsUseCase {
  constructor(
    @Inject(AZEYO_NOTIFICATION_REPOSITORY) private readonly notificationRepository: IAzeyoNotificationRepository,
  ) {}

  async execute(userId: number, page: number, size: number): Promise<{ items: AzeyoNotification[]; totalCount: number; unreadCount: number }> {
    const [result, unreadCount] = await Promise.all([
      this.notificationRepository.findManyByUserId(userId, (page - 1) * size, size),
      this.notificationRepository.countUnreadByUserId(userId),
    ]);
    return { ...result, unreadCount };
  }
}
