import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE, OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchUserNotFound } from '@/onchurch/user/domain/exception/onchurch-user.exception';

@Injectable()
export class OnchurchUserRepository implements IOnchurchUserRepository {
  constructor(
    @InjectRepository(OnchurchUser)
    private readonly userRepository: Repository<OnchurchUser>,
  ) {}

  async create(params: {
    loginId: string;
    password: string;
    name: string;
    phone: string;
    role: ONCHURCH_USER_ROLE;
    churchName: string | null;
    churchId: number | null;
    marketingConsent: boolean;
    freeTrialUntil: Date | null;
  }): Promise<number> {
    const user = await this.userRepository.save({
      loginId: params.loginId,
      password: params.password,
      name: params.name,
      phone: params.phone,
      role: params.role,
      churchName: params.churchName,
      churchId: params.churchId,
      marketingConsent: params.marketingConsent,
      freeTrialUntil: params.freeTrialUntil,
    });

    return user.id;
  }

  async findOneOrThrowById(id: number): Promise<OnchurchUser> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new OnchurchUserNotFound();

    return user;
  }

  async findByLoginId(loginId: string): Promise<OnchurchUser | null> {
    return this.userRepository.findOneBy({ loginId });
  }

  async findByPhone(phone: string): Promise<OnchurchUser[]> {
    return this.userRepository.find({
      where: { phone },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async existsByLoginId(loginId: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ loginId });
    return !!user;
  }

  async saveEntity(user: OnchurchUser): Promise<void> {
    await this.userRepository.save(user);
  }

  async findMembersByChurchId(churchId: number): Promise<OnchurchUser[]> {
    return this.userRepository.find({
      where: { churchId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findMemberByChurchId(churchId: number, id: number): Promise<OnchurchUser | null> {
    return this.userRepository.findOneBy({ id, churchId });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.userRepository.softDelete({ id });
  }
}
