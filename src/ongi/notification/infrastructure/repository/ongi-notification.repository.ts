import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { IOngiNotificationRepository } from '@/ongi/notification/domain/repository/ongi-notification.repository.interface';
import { OngiNotification, OngiNotificationCreator } from '@/ongi/notification/domain/entity/ongi-notification.entity';

@Injectable()
export class OngiNotificationRepository implements IOngiNotificationRepository {
  constructor(
    @InjectRepository(OngiNotification)
    private readonly notificationRepository: Repository<OngiNotification>,
  ) {}

  async createMany(creators: OngiNotificationCreator[]): Promise<void> {
    if (creators.length === 0) return;
    await this.notificationRepository.save(creators.map(creator => this.notificationRepository.create({ ...creator })));
  }

  async scanByRecipientUserId(userId: number, limit: number): Promise<OngiNotification[]> {
    return this.notificationRepository.find({
      where: { recipientUserId: userId },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: limit,
    });
  }

  async markAllRead(userId: number): Promise<void> {
    await this.notificationRepository.update({ recipientUserId: userId, readAt: IsNull() }, { readAt: new Date() });
  }
}
