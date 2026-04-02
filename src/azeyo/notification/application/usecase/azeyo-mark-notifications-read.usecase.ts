import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_NOTIFICATION_REPOSITORY, IAzeyoNotificationRepository } from '@/azeyo/notification/domain/repository/azeyo-notification.repository.interface';

@Injectable()
export class AzeyoMarkNotificationsReadUseCase {
  constructor(
    @Inject(AZEYO_NOTIFICATION_REPOSITORY) private readonly notificationRepository: IAzeyoNotificationRepository,
  ) {}

  async execute(userId: number, notificationId?: number): Promise<void> {
    if (notificationId) {
      await this.notificationRepository.markAsRead(notificationId, userId);
    } else {
      await this.notificationRepository.markAllAsRead(userId);
    }
  }
}
