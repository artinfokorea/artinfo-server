import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchBannerRepository, OnchurchBannerWriteParams } from '@/onchurch/banner/domain/repository/onchurch-banner.repository.interface';
import { OnchurchBanner } from '@/onchurch/banner/domain/entity/onchurch-banner.entity';
import { OnchurchBannerNotFound } from '@/onchurch/banner/domain/exception/onchurch-banner.exception';

@Injectable()
export class OnchurchBannerRepository implements IOnchurchBannerRepository {
  constructor(
    @InjectRepository(OnchurchBanner)
    private readonly bannerRepository: Repository<OnchurchBanner>,
  ) {}

  async findActiveByChurchId(churchId: number): Promise<OnchurchBanner[]> {
    return this.bannerRepository.find({
      where: { churchId, isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findAllByChurchId(churchId: number): Promise<OnchurchBanner[]> {
    return this.bannerRepository.find({
      where: { churchId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchBanner | null> {
    return this.bannerRepository.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchBannerWriteParams): Promise<OnchurchBanner> {
    return this.bannerRepository.save({
      churchId,
      title: params.title,
      description: params.description,
      imageUrl: params.imageUrl,
      linkUrl: params.linkUrl,
      sortOrder: params.sortOrder,
      isActive: params.isActive,
    });
  }

  async update(churchId: number, id: number, params: OnchurchBannerWriteParams): Promise<OnchurchBanner> {
    const banner = await this.bannerRepository.findOneBy({ id, churchId });
    if (!banner) throw new OnchurchBannerNotFound();
    Object.assign(banner, params);
    return this.bannerRepository.save(banner);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const banner = await this.bannerRepository.findOneBy({ id, churchId });
    if (!banner) throw new OnchurchBannerNotFound();
    await this.bannerRepository.softRemove(banner);
  }
}
