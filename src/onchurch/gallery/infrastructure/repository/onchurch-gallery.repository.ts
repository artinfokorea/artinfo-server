import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchGalleryRepository,
  OnchurchGalleryWriteParams,
} from '@/onchurch/gallery/domain/repository/onchurch-gallery.repository.interface';
import { OnchurchGallery } from '@/onchurch/gallery/domain/entity/onchurch-gallery.entity';
import { OnchurchGalleryNotFound } from '@/onchurch/gallery/domain/exception/onchurch-gallery.exception';

@Injectable()
export class OnchurchGalleryRepository implements IOnchurchGalleryRepository {
  constructor(
    @InjectRepository(OnchurchGallery)
    private readonly repo: Repository<OnchurchGallery>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchGallery[]> {
    return this.repo.find({ where: { churchId }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchGallery[]> {
    return this.repo.find({ where: { churchId, isActive: true }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async findActivePagedByChurchId(
    churchId: number,
    params: { categoryId?: number | null; skip: number; take: number },
  ): Promise<{ items: OnchurchGallery[]; totalCount: number }> {
    const qb = this.repo
      .createQueryBuilder('g')
      .where('g.churchId = :churchId', { churchId })
      .andWhere('g.isActive = true')
      .orderBy('g.createdAt', 'DESC')
      .addOrderBy('g.id', 'DESC')
      .skip(params.skip)
      .take(params.take);

    if (params.categoryId != null) {
      qb.andWhere('g.categoryId = :categoryId', { categoryId: params.categoryId });
    }

    const [items, totalCount] = await qb.getManyAndCount();
    return { items, totalCount };
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchGallery | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchGalleryWriteParams): Promise<OnchurchGallery> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchGalleryWriteParams): Promise<OnchurchGallery> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchGalleryNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchGalleryNotFound();
    await this.repo.softRemove(v);
  }
}
