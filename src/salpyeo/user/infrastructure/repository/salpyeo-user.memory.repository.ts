import { ISalpyeoUserRepository } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { SALPYEO_SNS_TYPE, SalpyeoUser, SalpyeoUserCreator } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SalpyeoUserNotFound } from '@/salpyeo/user/domain/exception/salpyeo-user.exception';

/** Postgres 없이 프론트 연동을 확인할 때 쓰는 인메모리 저장소 (SALPYEO_REPOSITORY=memory). 프로세스가 죽으면 가입 기록도 사라진다. */
export class SalpyeoUserMemoryRepository implements ISalpyeoUserRepository {
  private readonly users: SalpyeoUser[] = [];
  private sequence = 0;

  async create(creator: SalpyeoUserCreator): Promise<SalpyeoUser> {
    const now = new Date();
    const user = {
      id: ++this.sequence,
      name: creator.name,
      snsType: creator.snsType,
      snsId: creator.snsId,
      email: creator.email,
      iconImageUrl: creator.iconImageUrl,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    } as SalpyeoUser;
    this.users.push(user);

    return user;
  }

  async findById(id: number): Promise<SalpyeoUser | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async findOneOrThrowById(id: number): Promise<SalpyeoUser> {
    const user = await this.findById(id);
    if (!user) throw new SalpyeoUserNotFound();

    return user;
  }

  async findBySnsId(snsType: SALPYEO_SNS_TYPE, snsId: string): Promise<SalpyeoUser | null> {
    return this.users.find(u => u.snsType === snsType && u.snsId === snsId) ?? null;
  }

  async updateProfile(userId: number, patch: { name: string; email: string | null; iconImageUrl: string | null }): Promise<SalpyeoUser> {
    const user = await this.findOneOrThrowById(userId);
    user.name = patch.name;
    user.email = patch.email;
    user.iconImageUrl = patch.iconImageUrl;
    user.updatedAt = new Date();

    return user;
  }
}
