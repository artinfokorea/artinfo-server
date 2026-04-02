import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoNotification } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';
import { IAzeyoNotificationRepository } from '@/azeyo/notification/domain/repository/azeyo-notification.repository.interface';

@Injectable()
export class AzeyoNotificationRepository implements IAzeyoNotificationRepository {
  constructor(
    @InjectRepository(AzeyoNotification)
    private readonly repository: Repository<AzeyoNotification>,
  ) {}

  async create(notification: Partial<AzeyoNotification>): Promise<AzeyoNotification> {
    const entity = this.repository.create(notification);
    return this.repository.save(entity);
  }

  async findManyByUserId(userId: number, skip: number, take: number): Promise<{ items: AzeyoNotification[]; totalCount: number }> {
    const [items, totalCount] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return { items, totalCount };
  }

  async countUnreadByUserId(userId: number): Promise<number> {
    return this.repository.countBy({ userId, isRead: false });
  }

  async markAsRead(id: number, userId: number): Promise<void> {
    await this.repository.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.repository.update({ userId, isRead: false }, { isRead: true });
  }
}
