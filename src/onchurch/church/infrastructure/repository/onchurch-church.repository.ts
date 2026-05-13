import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchChurchRepository, OnchurchChurchUpsertParams } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchChurchNotFound } from '@/onchurch/church/domain/exception/onchurch-church.exception';

@Injectable()
export class OnchurchChurchRepository implements IOnchurchChurchRepository {
  constructor(
    @InjectRepository(OnchurchChurch)
    private readonly churchRepository: Repository<OnchurchChurch>,
  ) {}

  async findByOwnerId(ownerId: number): Promise<OnchurchChurch | null> {
    return this.churchRepository.findOneBy({ ownerId });
  }

  async findBySlug(slug: string): Promise<OnchurchChurch | null> {
    return this.churchRepository.findOneBy({ slug });
  }

  async findPublishedBySlug(slug: string): Promise<OnchurchChurch | null> {
    return this.churchRepository.findOneBy({ slug, isPublished: true });
  }

  async findAllPublished(): Promise<OnchurchChurch[]> {
    return this.churchRepository.find({
      where: { isPublished: true },
      order: { firstPublishedAt: 'DESC', id: 'DESC' },
    });
  }

  async upsertByOwnerId(ownerId: number, params: OnchurchChurchUpsertParams): Promise<OnchurchChurch> {
    const existing = await this.churchRepository.findOneBy({ ownerId });

    if (existing) {
      Object.assign(existing, {
        slug: params.slug,
        name: params.name,
        eng: params.eng,
        tagline: params.tagline,
        phone: params.phone,
        email: params.email,
        address: params.address,
        representative: params.representative,
        businessNo: params.businessNo,
        logoUrl: params.logoUrl,
        enabledPages: params.enabledPages,
      });
      return this.churchRepository.save(existing);
    }

    const created = this.churchRepository.create({ ownerId, ...params });
    return this.churchRepository.save(created);
  }

  async updatePublished(ownerId: number, isPublished: boolean, firstPublishedAt?: Date): Promise<OnchurchChurch> {
    const church = await this.churchRepository.findOneBy({ ownerId });
    if (!church) throw new OnchurchChurchNotFound();
    church.isPublished = isPublished;
    if (firstPublishedAt && !church.firstPublishedAt) {
      church.firstPublishedAt = firstPublishedAt;
    }
    return this.churchRepository.save(church);
  }
}
