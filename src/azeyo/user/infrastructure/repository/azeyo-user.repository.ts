import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { AzeyoUserNotFound } from '@/azeyo/user/domain/exception/azeyo-user.exception';

@Injectable()
export class AzeyoUserRepository implements IAzeyoUserRepository {
  constructor(
    @InjectRepository(AzeyoUser)
    private readonly userRepository: Repository<AzeyoUser>,
  ) {}

  async create(params: {
    nickname: string;
    marriageYear: number;
    children: string;
    email: string | null;
    snsType: string | null;
    snsId: string | null;
    iconImageUrl: string | null;
  }): Promise<number> {
    const user = await this.userRepository.save({
      nickname: params.nickname,
      marriageYear: params.marriageYear,
      children: params.children,
      email: params.email,
      snsType: params.snsType,
      snsId: params.snsId,
      iconImageUrl: params.iconImageUrl,
    });

    return user.id;
  }

  async findOneOrThrowById(id: number): Promise<AzeyoUser> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new AzeyoUserNotFound();

    return user;
  }

  async findBySnsId(snsType: string, snsId: string): Promise<AzeyoUser | null> {
    return this.userRepository.findOneBy({ snsType, snsId });
  }

  async findByEmail(email: string): Promise<AzeyoUser | null> {
    return this.userRepository.findOneBy({ email });
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ nickname });
    return !!user;
  }

  async saveEntity(user: AzeyoUser): Promise<void> {
    await this.userRepository.save(user);
  }

  async findTopMonthlyUsers(count: number): Promise<AzeyoUser[]> {
    return this.userRepository.find({
      order: { monthlyPoints: 'DESC' },
      take: count,
    });
  }
}
