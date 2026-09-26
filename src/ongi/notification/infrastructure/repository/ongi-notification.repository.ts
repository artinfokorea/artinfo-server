import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { IOngiNotificationRepository } from '@/ongi/notification/domain/repository/ongi-notification.repository.interface';
import { OngiNotification } from '@/ongi/notification/domain/entity/ongi-notification.entity';
import { OngiNotificationSeen } from '@/ongi/notification/domain/entity/ongi-notification-seen.entity';
import { OngiNotificationCreator } from '@/ongi/notification/domain/service/ongi-notification';

@Injectable()
export class OngiNotificationRepository implements IOngiNotificationRepository {
  constructor(
    @InjectRepository(OngiNotification)
    private readonly notificationRepository: Repository<OngiNotification>,

    @InjectRepository(OngiNotificationSeen)
    private readonly seenRepository: Repository<OngiNotificationSeen>,
  ) {}

  async createMany(records: OngiNotificationCreator[]): Promise<void> {
    if (records.length === 0) return;
    await this.notificationRepository.insert(records.map(record => this.notificationRepository.create(record)));
  }

  async scanByUserId(userId: number, since: Date, limit: number): Promise<OngiNotification[]> {
    return this.notificationRepository.find({
      where: { userId, createdAt: MoreThanOrEqual(since) },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: limit,
    });
  }

  async countUnseen(userId: number, since: Date, after: Date | null): Promise<number> {
    // 마지막으로 본 시각이 보관 기간 안이면 그 뒤 것만, 아니면(오래됐거나 없음) 보관 기간 안 전부
    const createdAt = after && after > since ? MoreThan(after) : MoreThanOrEqual(since);
    return this.notificationRepository.count({ where: { userId, createdAt } });
  }

  async findSeenAt(userId: number): Promise<Date | null> {
    const row = await this.seenRepository.findOneBy({ userId });
    return row ? row.seenAt : null;
  }

  async markSeen(userId: number, seenAt: Date): Promise<void> {
    await this.seenRepository.save(this.seenRepository.create({ userId, seenAt }));
  }

  async deleteOlderThan(cutoff: Date): Promise<number> {
    const result = await this.notificationRepository.delete({ createdAt: LessThan(cutoff) });
    return result.affected ?? 0;
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.notificationRepository.delete({ userId });
    await this.seenRepository.delete({ userId });
  }
}
