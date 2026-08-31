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

  async updateProfile(userId: number, patch: { name?: string; iconImageUrl?: string }): Promise<void> {
    const userPatch: Partial<OngiUser> = {};
    if (patch.name !== undefined) userPatch.name = patch.name;
    if (patch.iconImageUrl !== undefined) userPatch.iconImageUrl = patch.iconImageUrl;
    if (Object.keys(userPatch).length === 0) return;

    await this.userRepository.manager.transaction(async manager => {
      await manager.getRepository(OngiUser).update({ id: userId }, userPatch);

      // 피드·인물 표시가 어긋나지 않도록 구성원과 자동 생성 인물에도 전파
      if (patch.name !== undefined) {
        await manager.query('UPDATE ongi_members SET name = $1 WHERE user_id = $2 AND deleted_at IS NULL', [patch.name, userId]);
        await manager.query(
          `UPDATE ongi_people SET name = $1
            WHERE member_id IN (SELECT id FROM ongi_members WHERE user_id = $2) AND deleted_at IS NULL`,
          [patch.name, userId],
        );
      }
      if (patch.iconImageUrl !== undefined) {
        await manager.query('UPDATE ongi_members SET avatar_url = $1 WHERE user_id = $2 AND deleted_at IS NULL', [patch.iconImageUrl, userId]);
        await manager.query(
          `UPDATE ongi_people SET image_url = $1
            WHERE member_id IN (SELECT id FROM ongi_members WHERE user_id = $2) AND deleted_at IS NULL`,
          [patch.iconImageUrl, userId],
        );
      }
    });
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

  /**
   * 회원 탈퇴 — 계정과 연관 데이터를 한 트랜잭션에서 삭제한다 (App Store 5.1.1(v)).
   * - 사용자 행은 익명화 후 소프트 삭제 (sns_id 를 바꿔 같은 계정으로 재가입 가능)
   * - 구성원·사진·댓글·자동 생성 인물은 소프트 삭제, 좋아요·차단·토큰은 즉시 삭제
   * - S3 에 올라간 이미지 파일 자체는 삭제하지 않는다 (추후 배치 정리 대상)
   */
  async softDeleteById(id: number): Promise<string[]> {
    return this.userRepository.manager.transaction(async manager => {
      const [user]: { icon_image_url: string | null }[] = await manager.query(
        `SELECT icon_image_url FROM ongi_users WHERE id = $1 AND deleted_at IS NULL`,
        [id],
      );
      const photoRows: { url: string; thumb_url: string | null }[] = await manager.query(
        `SELECT url, thumb_url FROM ongi_photos
          WHERE deleted_at IS NULL
            AND author_member_id IN (SELECT id FROM ongi_members WHERE user_id = $1)`,
        [id],
      );

      await manager.query(
        `UPDATE ongi_users
            SET name = '탈퇴한 사용자',
                email = NULL,
                icon_image_url = NULL,
                sns_id = 'deleted:' || id || ':' || sns_id,
                deleted_at = now()
          WHERE id = $1 AND deleted_at IS NULL`,
        [id],
      );

      // 댓글·좋아요를 지우면 사진의 비정규화 카운터(comment_count·like_count)도 함께 맞춰야 목록 숫자가 어긋나지 않는다
      const commentedRows: { photo_id: number }[] = await manager.query(
        `SELECT DISTINCT photo_id FROM ongi_photo_comments
          WHERE deleted_at IS NULL
            AND author_member_id IN (SELECT id FROM ongi_members WHERE user_id = $1)`,
        [id],
      );
      const likedRows: { photo_id: number }[] = await manager.query(`SELECT DISTINCT photo_id FROM ongi_photo_likes WHERE user_id = $1`, [id]);

      await manager.query(
        `UPDATE ongi_photo_comments SET deleted_at = now()
          WHERE deleted_at IS NULL
            AND author_member_id IN (SELECT id FROM ongi_members WHERE user_id = $1)`,
        [id],
      );
      await manager.query(
        `UPDATE ongi_photos SET deleted_at = now()
          WHERE deleted_at IS NULL
            AND author_member_id IN (SELECT id FROM ongi_members WHERE user_id = $1)`,
        [id],
      );
      await manager.query(
        `UPDATE ongi_people SET deleted_at = now()
          WHERE deleted_at IS NULL
            AND member_id IN (SELECT id FROM ongi_members WHERE user_id = $1)`,
        [id],
      );
      await manager.query(`UPDATE ongi_members SET deleted_at = now() WHERE user_id = $1 AND deleted_at IS NULL`, [id]);

      await manager.query(`DELETE FROM ongi_photo_likes WHERE user_id = $1`, [id]);

      const commentedPhotoIds = commentedRows.map(r => Number(r.photo_id));
      if (commentedPhotoIds.length > 0) {
        await manager.query(
          `UPDATE ongi_photos p
              SET comment_count = (SELECT COUNT(*) FROM ongi_photo_comments c WHERE c.photo_id = p.id AND c.deleted_at IS NULL)
            WHERE p.id = ANY($1)`,
          [commentedPhotoIds],
        );
      }
      const likedPhotoIds = likedRows.map(r => Number(r.photo_id));
      if (likedPhotoIds.length > 0) {
        await manager.query(
          `UPDATE ongi_photos p
              SET like_count = (SELECT COUNT(*) FROM ongi_photo_likes l WHERE l.photo_id = p.id)
            WHERE p.id = ANY($1)`,
          [likedPhotoIds],
        );
      }
      await manager.query(`DELETE FROM ongi_blocks WHERE user_id = $1 OR blocked_user_id = $1`, [id]);
      // 발급된 로그인 토큰도 즉시 무효화
      await manager.query(`DELETE FROM ongi_auths WHERE user_id = $1`, [id]);

      // 멀티 그룹 업로드로 다른 사람 사진이 같은 파일을 쓸 수는 없지만(작성자 기준 삭제), 방어적으로 살아있는 참조가 없는 것만 고른다
      const thumbByUrl = new Map(photoRows.filter(r => r.thumb_url).map(r => [r.url, r.thumb_url!] as const));
      const urls = [...new Set(photoRows.map(r => r.url))];
      const orphanUrls: string[] = [];
      for (const url of urls) {
        const [{ count }]: { count: string }[] = await manager.query(
          `SELECT COUNT(*)::text AS count FROM ongi_photos WHERE url = $1 AND deleted_at IS NULL`,
          [url],
        );
        if (count === '0') {
          orphanUrls.push(url);
          const thumb = thumbByUrl.get(url);
          if (thumb) orphanUrls.push(thumb);
        }
      }
      if (user?.icon_image_url) orphanUrls.push(user.icon_image_url);

      return orphanUrls;
    });
  }
}
