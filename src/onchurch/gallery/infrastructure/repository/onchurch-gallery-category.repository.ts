import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchGalleryCategoryRepository,
  OnchurchGalleryCategoryWriteParams,
} from '@/onchurch/gallery/domain/repository/onchurch-gallery-category.repository.interface';
import { OnchurchGalleryCategory } from '@/onchurch/gallery/domain/entity/onchurch-gallery-category.entity';
import { OnchurchGalleryCategoryNotFound } from '@/onchurch/gallery/domain/exception/onchurch-gallery.exception';

@Injectable()
export class OnchurchGalleryCategoryRepository implements IOnchurchGalleryCategoryRepository {
  constructor(
    @InjectRepository(OnchurchGalleryCategory)
    private readonly repo: Repository<OnchurchGalleryCategory>,
  ) {}

  // '전체' 보기('전체') 카테고리를 한 번이라도 만든 적 있으면(삭제 포함) 다시 만들지 않는다.
  async ensureAllCategory(churchId: number): Promise<void> {
    const existing = await this.repo.findOne({ where: { churchId, isAll: true }, withDeleted: true });
    if (existing) return;
    await this.repo.save({ churchId, name: '전체', sortOrder: 0, isActive: true, isAll: true });
  }

  // 관리자가 명시적으로 '전체' 보기를 다시 켜는 경우: 삭제했던 것을 복구하거나 없으면 새로 만든다.
  async restoreAllCategory(churchId: number): Promise<void> {
    const existing = await this.repo.findOne({ where: { churchId, isAll: true }, withDeleted: true });
    if (existing) {
      if (existing.deletedAt) await this.repo.recover(existing);
      return;
    }
    await this.repo.save({ churchId, name: '전체', sortOrder: 0, isActive: true, isAll: true });
  }

  async findAllByChurchId(churchId: number): Promise<OnchurchGalleryCategory[]> {
    return this.repo.find({ where: { churchId }, order: { isAll: 'DESC', createdAt: 'DESC', id: 'DESC' } });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchGalleryCategory[]> {
    return this.repo.find({ where: { churchId, isActive: true }, order: { isAll: 'DESC', createdAt: 'DESC', id: 'DESC' } });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchGalleryCategory | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchGalleryCategoryWriteParams): Promise<OnchurchGalleryCategory> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchGalleryCategoryWriteParams): Promise<OnchurchGalleryCategory> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchGalleryCategoryNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchGalleryCategoryNotFound();
    await this.repo.softRemove(v);
  }
}
