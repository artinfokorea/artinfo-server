import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IOngiPushTokenRepository } from '@/ongi/push/domain/repository/ongi-push-token.repository.interface';
import { OngiPushToken } from '@/ongi/push/domain/entity/ongi-push-token.entity';

@Injectable()
export class OngiPushTokenRepository implements IOngiPushTokenRepository {
  constructor(
    @InjectRepository(OngiPushToken)
    private readonly pushTokenRepository: Repository<OngiPushToken>,
  ) {}

  async upsert(userId: number, token: string, platform: string): Promise<void> {
    const existing = await this.pushTokenRepository.findOneBy({ token });
    if (existing) {
      if (existing.userId !== userId || existing.platform !== platform) {
        await this.pushTokenRepository.update({ id: existing.id }, { userId, platform });
      }
      return;
    }
    await this.pushTokenRepository.save(this.pushTokenRepository.create({ userId, token, platform }));
  }

  async deleteByToken(token: string): Promise<void> {
    await this.pushTokenRepository.delete({ token });
  }

  async deleteByTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;
    await this.pushTokenRepository.delete({ token: In(tokens) });
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.pushTokenRepository.delete({ userId });
  }

  async scanByUserIds(userIds: number[]): Promise<OngiPushToken[]> {
    if (userIds.length === 0) return [];
    return this.pushTokenRepository.find({ where: { userId: In(userIds) } });
  }
}
