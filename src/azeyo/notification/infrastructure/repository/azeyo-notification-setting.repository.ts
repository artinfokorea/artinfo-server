import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoNotificationSetting } from '@/azeyo/notification/domain/entity/azeyo-notification-setting.entity';
import { IAzeyoNotificationSettingRepository } from '@/azeyo/notification/domain/repository/azeyo-notification-setting.repository.interface';

@Injectable()
export class AzeyoNotificationSettingRepository implements IAzeyoNotificationSettingRepository {
  constructor(
    @InjectRepository(AzeyoNotificationSetting)
    private readonly repository: Repository<AzeyoNotificationSetting>,
  ) {}

  async findByUserId(userId: number): Promise<AzeyoNotificationSetting | null> {
    return this.repository.findOneBy({ userId });
  }

  async upsert(userId: number, settings: Partial<AzeyoNotificationSetting>): Promise<AzeyoNotificationSetting> {
    const existing = await this.repository.findOneBy({ userId });
    if (existing) {
      Object.assign(existing, settings);
      return this.repository.save(existing);
    }
    return this.repository.save(this.repository.create({ userId, ...settings }));
  }
}
