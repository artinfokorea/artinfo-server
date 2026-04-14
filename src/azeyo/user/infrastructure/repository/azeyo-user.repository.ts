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
    name: string | null;
    nickname: string;
    marriageDate: string | null;
    children: string;
    gender: string | null;
    ageRange: string | null;
    birthDate: string | null;
    phone: string | null;
    email: string | null;
    snsType: string | null;
    snsId: string | null;
    iconImageUrl: string | null;
    marketingConsent: boolean;
  }): Promise<number> {
    const user = await this.userRepository.save({
      name: params.name,
      nickname: params.nickname,
      marriageDate: params.marriageDate,
      children: params.children,
      gender: params.gender,
      ageRange: params.ageRange,
      birthDate: params.birthDate,
      phone: params.phone,
      email: params.email,
      snsType: params.snsType,
      snsId: params.snsId,
      iconImageUrl: params.iconImageUrl,
      marketingConsent: params.marketingConsent,
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

  async findOneByNickname(nickname: string): Promise<AzeyoUser | null> {
    return this.userRepository.findOneBy({ nickname });
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

  async findAllPaging(skip: number, take: number): Promise<{ items: AzeyoUser[]; totalCount: number }> {
    const [items, totalCount] = await this.userRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return { items, totalCount };
  }
}
