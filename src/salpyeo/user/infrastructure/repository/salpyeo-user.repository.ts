import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISalpyeoUserRepository } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { SALPYEO_SNS_TYPE, SalpyeoUser, SalpyeoUserCreator } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SalpyeoUserNotFound } from '@/salpyeo/user/domain/exception/salpyeo-user.exception';

@Injectable()
export class SalpyeoUserRepository implements ISalpyeoUserRepository {
  constructor(
    @InjectRepository(SalpyeoUser)
    private readonly userRepository: Repository<SalpyeoUser>,
  ) {}

  async create(creator: SalpyeoUserCreator): Promise<SalpyeoUser> {
    return this.userRepository.save({
      name: creator.name,
      snsType: creator.snsType,
      snsId: creator.snsId,
      email: creator.email,
      iconImageUrl: creator.iconImageUrl,
    });
  }

  async findById(id: number): Promise<SalpyeoUser | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findOneOrThrowById(id: number): Promise<SalpyeoUser> {
    const user = await this.findById(id);
    if (!user) throw new SalpyeoUserNotFound();

    return user;
  }

  async findBySnsId(snsType: SALPYEO_SNS_TYPE, snsId: string): Promise<SalpyeoUser | null> {
    return this.userRepository.findOneBy({ snsType, snsId });
  }

  async updateProfile(userId: number, patch: { name: string; email: string | null; iconImageUrl: string | null }): Promise<SalpyeoUser> {
    await this.userRepository.update({ id: userId }, patch);

    return this.findOneOrThrowById(userId);
  }
}
