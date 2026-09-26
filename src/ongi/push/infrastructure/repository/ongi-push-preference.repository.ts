import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IOngiPushPreferenceRepository } from '@/ongi/push/domain/repository/ongi-push-preference.repository.interface';
import { OngiPushPreference } from '@/ongi/push/domain/entity/ongi-push-preference.entity';
import { OngiPushPreferences } from '@/ongi/push/domain/service/ongi-push-preference';

function toPreferences(row: OngiPushPreference): OngiPushPreferences {
  return { photo: row.photoEnabled, comment: row.commentEnabled, like: row.likeEnabled, event: row.eventEnabled, family: row.familyEnabled };
}

@Injectable()
export class OngiPushPreferenceRepository implements IOngiPushPreferenceRepository {
  constructor(
    @InjectRepository(OngiPushPreference)
    private readonly preferenceRepository: Repository<OngiPushPreference>,
  ) {}

  async findByUserId(userId: number): Promise<OngiPushPreferences | null> {
    const row = await this.preferenceRepository.findOneBy({ userId });
    return row ? toPreferences(row) : null;
  }

  async scanByUserIds(userIds: number[]): Promise<Map<number, OngiPushPreferences>> {
    if (userIds.length === 0) return new Map();
    const rows = await this.preferenceRepository.find({ where: { userId: In(userIds) } });
    return new Map(rows.map(row => [row.userId, toPreferences(row)]));
  }

  async save(userId: number, preferences: OngiPushPreferences): Promise<void> {
    await this.preferenceRepository.save(
      this.preferenceRepository.create({
        userId,
        photoEnabled: preferences.photo,
        commentEnabled: preferences.comment,
        likeEnabled: preferences.like,
        eventEnabled: preferences.event,
        familyEnabled: preferences.family,
      }),
    );
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.preferenceRepository.delete({ userId });
  }
}
