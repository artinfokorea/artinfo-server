import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { IOngiPhotoRepository } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
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
      aspectRatio: creator.aspectRatio,
      caption: creator.caption,
      location: creator.location,
      personIds: creator.personIds,
    });
  }

  async findById(id: number): Promise<OngiPhoto | null> {
    return this.photoRepository.findOneBy({ id });
  }

  async scanByGroupId(groupId: number): Promise<OngiPhoto[]> {
    return this.photoRepository.find({ where: { groupId }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async scanByAlbumId(albumId: number): Promise<OngiPhoto[]> {
    return this.photoRepository.find({ where: { albumId }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async scanUnfiledByGroupId(groupId: number): Promise<OngiPhoto[]> {
    return this.photoRepository.find({ where: { groupId, albumId: IsNull() }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async scanByPersonId(groupId: number, personId: number): Promise<OngiPhoto[]> {
    return this.photoRepository
      .createQueryBuilder('photo')
      .where('photo.groupId = :groupId', { groupId })
      .andWhere('photo.person_ids @> :personId::jsonb', { personId: JSON.stringify([personId]) })
      .orderBy('photo.createdAt', 'DESC')
      .addOrderBy('photo.id', 'DESC')
      .getMany();
  }

  async likedPhotoIdsOf(userId: number, photoIds: number[]): Promise<number[]> {
    if (photoIds.length === 0) return [];

    const likes = await this.likeRepository.find({ where: { userId, photoId: In(photoIds) } });

    return likes.map(like => like.photoId);
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

  async update(photoId: number, patch: { caption: string | null; albumId: number | null }): Promise<void> {
    await this.photoRepository.update({ id: photoId }, patch);
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
