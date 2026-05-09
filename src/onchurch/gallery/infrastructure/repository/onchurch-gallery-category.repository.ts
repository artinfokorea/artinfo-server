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

  async findAllByChurchId(churchId: number): Promise<OnchurchGalleryCategory[]> {
    return this.repo.find({ where: { churchId }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchGalleryCategory[]> {
    return this.repo.find({ where: { churchId, isActive: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
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
