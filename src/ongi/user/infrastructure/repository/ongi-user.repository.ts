import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOngiUserRepository, OngiProfileStats } from '@/ongi/user/domain/repository/ongi-user.repository.interface';
import { ONGI_SNS_TYPE, OngiUser, OngiUserCreator } from '@/ongi/user/domain/entity/ongi-user.entity';
import { OngiUserNotFound } from '@/ongi/user/domain/exception/ongi-user.exception';

@Injectable()
export class OngiUserRepository implements IOngiUserRepository {
  constructor(
    @InjectRepository(OngiUser)
    private readonly userRepository: Repository<OngiUser>,
  ) {}

  async create(creator: OngiUserCreator): Promise<OngiUser> {
    return this.userRepository.save({
      name: creator.name,
      snsType: creator.snsType,
      snsId: creator.snsId,
      iconImageUrl: creator.iconImageUrl,
      email: creator.email,
    });
  }

  async findById(id: number): Promise<OngiUser | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findOneOrThrowById(id: number): Promise<OngiUser> {
    const user = await this.findById(id);
    if (!user) throw new OngiUserNotFound();

    return user;
  }

  async findBySnsId(snsType: ONGI_SNS_TYPE, snsId: string): Promise<OngiUser | null> {
    return this.userRepository.findOneBy({ snsType, snsId });
  }

  async getProfileStats(userId: number): Promise<OngiProfileStats> {
    const [row] = await this.userRepository.manager.query(
      `SELECT
         (SELECT COUNT(*) FROM ongi_photos p
            WHERE p.deleted_at IS NULL
              AND p.author_member_id IN (SELECT m.id FROM ongi_members m WHERE m.user_id = $1 AND m.deleted_at IS NULL)) AS photo_count,
         (SELECT COUNT(*) FROM ongi_albums a
            WHERE a.deleted_at IS NULL
              AND a.group_id IN (SELECT m.group_id FROM ongi_members m WHERE m.user_id = $1 AND m.deleted_at IS NULL)) AS album_count,
         (SELECT COUNT(*) FROM ongi_members m WHERE m.user_id = $1 AND m.deleted_at IS NULL) AS family_count`,
      [userId],
    );

    return {
      photoCount: Number(row.photo_count),
      albumCount: Number(row.album_count),
      familyCount: Number(row.family_count),
    };
  }

  async softDeleteById(id: number): Promise<void> {
    await this.userRepository.softDelete({ id });
    // 발급된 로그인 토큰도 즉시 무효화
    await this.userRepository.manager.query(`DELETE FROM ongi_auths WHERE user_id = $1`, [id]);
  }
}
