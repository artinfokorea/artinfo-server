import { ISalpyeoUserRepository } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { SALPYEO_SNS_TYPE, SALPYEO_USER_ROLE, SalpyeoUser, SalpyeoUserCreator } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SalpyeoUserNotFound } from '@/salpyeo/user/domain/exception/salpyeo-user.exception';

/**
 * Postgres 없이 프론트 연동을 확인할 때 쓰는 인메모리 저장소 (SALPYEO_REPOSITORY=memory).
 * 프로세스가 죽으면 가입 기록도 사라진다.
 * 로컬에서 관리자 페이지를 확인할 수 있도록 **첫 번째로 가입한 사용자만 ADMIN** 으로 만든다
 * (운영은 Postgres 구현을 쓰므로 이 규칙이 적용되지 않는다 — 승격은 DB 에서 직접).
 */
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
      role: this.users.length === 0 ? SALPYEO_USER_ROLE.ADMIN : SALPYEO_USER_ROLE.USER,
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
