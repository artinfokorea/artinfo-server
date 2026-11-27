import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

export interface Holy365UserCreator {
  name: string;
  email: string | null;
  snsType: string;
  snsId: string;
  iconImageUrl: string | null;
  locale: string;
}

@Injectable()
export class Holy365UserRepository {
  constructor(@InjectRepository(Holy365User) private readonly repository: Repository<Holy365User>) {}

  async create(creator: Holy365UserCreator): Promise<Holy365User> {
    const saved = await this.repository.save(this.repository.create(creator));

    return this.findOneOrThrow(saved.id);
  }

  findById(id: number): Promise<Holy365User | null> {
    return this.repository.findOneBy({ id });
  }

  async findOneOrThrow(id: number): Promise<Holy365User> {
    const user = await this.findById(id);
    if (!user) throw Holy365Errors.userNotFound();

    return user;
  }

  findBySns(snsType: string, snsId: string): Promise<Holy365User | null> {
    return this.repository.findOneBy({ snsType, snsId });
  }

  async update(id: number, patch: Partial<Pick<Holy365User, 'name' | 'locale'>>): Promise<void> {
    await this.repository.update({ id }, patch);
  }

  /** 탈퇴 — 계정 익명화(같은 이메일·소셜로 재가입 가능) + 세션·필사 기록 삭제를 한 트랜잭션으로 */
  async withdraw(id: number): Promise<void> {
    await this.repository.manager.transaction(async manager => {
      await manager.query(
        `UPDATE holy365_users
            SET name = '탈퇴한 사용자', email = NULL, icon_image_url = NULL,
                sns_id = 'withdrawn-' || id || '-' || extract(epoch from now())::bigint, deleted_at = now(), updated_at = now()
          WHERE id = $1`,
        [id],
      );
      for (const table of ['holy365_auths', 'holy365_verse_counts', 'holy365_user_versions', 'holy365_daily_activity']) {
        await manager.query(`DELETE FROM ${table} WHERE user_id = $1`, [id]);
      }
    });
  }
}
