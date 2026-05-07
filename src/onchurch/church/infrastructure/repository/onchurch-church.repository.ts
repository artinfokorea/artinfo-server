import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchChurchRepository, OnchurchChurchUpsertParams } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';

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
}
