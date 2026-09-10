import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISalpyeoInquiryRepository } from '@/salpyeo/inquiry/domain/repository/salpyeo-inquiry.repository.interface';
import { SalpyeoInquiry, SalpyeoInquiryCreator } from '@/salpyeo/inquiry/domain/entity/salpyeo-inquiry.entity';
import { SalpyeoInquiryNotFound } from '@/salpyeo/inquiry/domain/exception/salpyeo-inquiry.exception';

@Injectable()
export class SalpyeoInquiryRepository implements ISalpyeoInquiryRepository {
  constructor(
    @InjectRepository(SalpyeoInquiry)
    private readonly repo: Repository<SalpyeoInquiry>,
  ) {}

  async create(creator: SalpyeoInquiryCreator): Promise<SalpyeoInquiry> {
    return this.repo.save({
      title: creator.title,
      content: creator.content,
      email: creator.email,
      images: creator.images,
    });
  }

  async scan(limit: number): Promise<SalpyeoInquiry[]> {
    return this.repo.find({ order: { id: 'DESC' }, take: limit });
  }

  async setResolved(id: number, isResolved: boolean): Promise<SalpyeoInquiry> {
    const result = await this.repo.update({ id }, { isResolved });
    if (!result.affected) throw new SalpyeoInquiryNotFound();

    const inquiry = await this.repo.findOneBy({ id });
    if (!inquiry) throw new SalpyeoInquiryNotFound();

    return inquiry;
  }
}
