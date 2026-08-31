import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { IOngiPhotoRepository, type OngiPhotoScanOptions } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { OngiPhoto, OngiPhotoCreator } from '@/ongi/photo/domain/entity/ongi-photo.entity';
import { OngiPhotoLike } from '@/ongi/photo/domain/entity/ongi-photo-like.entity';
import { OngiPhotoComment, OngiPhotoCommentCreator } from '@/ongi/photo/domain/entity/ongi-photo-comment.entity';

@Injectable()
export class OngiPhotoRepository implements IOngiPhotoRepository {
  constructor(
    @InjectRepository(OngiPhoto)
    private readonly photoRepository: Repository<OngiPhoto>,

    @InjectRepository(OngiPhotoLike)
    private readonly likeRepository: Repository<OngiPhotoLike>,

    @InjectRepository(OngiPhotoComment)
    private readonly commentRepository: Repository<OngiPhotoComment>,
  ) {}

  async create(creator: OngiPhotoCreator): Promise<OngiPhoto> {
    return this.photoRepository.save({
      groupId: creator.groupId,
      authorMemberId: creator.authorMemberId,
      albumId: creator.albumId,
      url: creator.url,
      thumbUrl: creator.thumbUrl,
      aspectRatio: creator.aspectRatio,
      caption: creator.caption,
      location: creator.location,
      personIds: creator.personIds,
    });
  }

  async findById(id: number): Promise<OngiPhoto | null> {
    return this.photoRepository.findOneBy({ id });
  }

  /** 최신순 목록 공통 — 커서(after)·개수 제한(limit)·차단 작성자 제외를 SQL 로 처리해 페이지가 비지 않게 한다 */
  private listQuery(options?: OngiPhotoScanOptions) {
    const query = this.photoRepository
      .createQueryBuilder('photo')
      .orderBy('photo.createdAt', 'DESC')
      .addOrderBy('photo.id', 'DESC');
    if (options?.excludedMemberIds?.length) {
      query.andWhere('photo.author_member_id NOT IN (:...excludedMemberIds)', { excludedMemberIds: options.excludedMemberIds });
    }
    if (options?.after != null) {
      query.andWhere('(photo.created_at, photo.id) < (SELECT p.created_at, p.id FROM ongi_photos p WHERE p.id = :after)', { after: options.after });
    }
    if (options?.limit != null) query.take(options.limit);
    return query;
  }

  async scanByGroupId(groupId: number, options?: OngiPhotoScanOptions): Promise<OngiPhoto[]> {
    return this.listQuery(options).andWhere('photo.groupId = :groupId', { groupId }).getMany();
  }

  async scanByAlbumId(albumId: number, options?: OngiPhotoScanOptions): Promise<OngiPhoto[]> {
    return this.listQuery(options).andWhere('photo.albumId = :albumId', { albumId }).getMany();
  }

  async scanUnfiledByGroupId(groupId: number, options?: OngiPhotoScanOptions): Promise<OngiPhoto[]> {
    return this.listQuery(options).andWhere('photo.groupId = :groupId', { groupId }).andWhere('photo.album_id IS NULL').getMany();
  }

  async scanByPersonId(groupId: number, personId: number, options?: OngiPhotoScanOptions): Promise<OngiPhoto[]> {
    return this.listQuery(options)
      .andWhere('photo.groupId = :groupId', { groupId })
      .andWhere('photo.person_ids @> :personId::jsonb', { personId: JSON.stringify([personId]) })
      .getMany();
  }

  async likedPhotoIdsOf(userId: number, photoIds: number[]): Promise<number[]> {
    if (photoIds.length === 0) return [];

    const likes = await this.likeRepository.find({ where: { userId, photoId: In(photoIds) } });

    return likes.map(like => like.photoId);
  }

  async countCommentsByPhotoIds(photoIds: number[], excludedMemberIds: number[]): Promise<Map<number, number>> {
    if (photoIds.length === 0) return new Map();

    const rows: { photo_id: number; count: string }[] = await this.photoRepository.manager.query(
      `SELECT photo_id, COUNT(*)::text AS count FROM ongi_photo_comments
        WHERE photo_id = ANY($1) AND deleted_at IS NULL AND NOT (author_member_id = ANY($2))
        GROUP BY photo_id`,
      [photoIds, excludedMemberIds],
    );

    return new Map(rows.map(row => [Number(row.photo_id), Number(row.count)]));
  }

  async toggleLike(photoId: number, userId: number): Promise<boolean> {
    return this.photoRepository.manager.transaction(async manager => {
      const existing = await manager.findOne(OngiPhotoLike, { where: { photoId, userId } });

      if (existing) {
        await manager.delete(OngiPhotoLike, { id: existing.id });
        await manager.decrement(OngiPhoto, { id: photoId }, 'likeCount', 1);

        return false;
      }

      await manager.save(OngiPhotoLike, { photoId, userId });
      await manager.increment(OngiPhoto, { id: photoId }, 'likeCount', 1);

      return true;
    });
  }

  async scanCommentsByPhotoId(photoId: number): Promise<OngiPhotoComment[]> {
    return this.commentRepository.find({ where: { photoId }, order: { createdAt: 'ASC', id: 'ASC' } });
  }

  async createComment(creator: OngiPhotoCommentCreator): Promise<OngiPhotoComment> {
    const comment = await this.commentRepository.save({
      photoId: creator.photoId,
      authorMemberId: creator.authorMemberId,
      text: creator.text,
    });
    await this.photoRepository.increment({ id: creator.photoId }, 'commentCount', 1);

    return comment;
  }

  async findCommentById(id: number): Promise<OngiPhotoComment | null> {
    return this.commentRepository.findOneBy({ id });
  }

  async countActiveByUrl(url: string): Promise<number> {
    return this.photoRepository.count({ where: { url, deletedAt: IsNull() } });
  }

  async moveToAlbum(photoIds: number[], albumId: number | null): Promise<void> {
    if (photoIds.length === 0) return;
    await this.photoRepository.update({ id: In(photoIds) }, { albumId });
  }

  async softDeletePhoto(photoId: number): Promise<void> {
    await this.photoRepository.manager.transaction(async manager => {
      await manager.softDelete(OngiPhotoComment, { photoId });
      await manager.softDelete(OngiPhoto, { id: photoId });
    });
  }

  async softDeleteComment(commentId: number, photoId: number): Promise<void> {
    await this.photoRepository.manager.transaction(async manager => {
      const result = await manager.softDelete(OngiPhotoComment, { id: commentId, photoId });
      if (result.affected) {
        await manager.decrement(OngiPhoto, { id: photoId }, 'commentCount', 1);
      }
    });
  }

  async memberIdsOfUsers(userIds: number[]): Promise<number[]> {
    if (userIds.length === 0) return [];

    const rows: { id: number }[] = await this.photoRepository.manager.query(`SELECT id FROM ongi_members WHERE user_id = ANY($1) AND deleted_at IS NULL`, [
      userIds,
    ]);

    return rows.map(row => Number(row.id));
  }
}
