import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InquiryCreator } from '@/system/repository/operation/inquiry.creator';
import { Inquiry } from '@/system/entity/inquiry.entity';

@Injectable()
export class InquiryRepository {
  constructor(
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  async create(creator: InquiryCreator): Promise<number> {
    const inquiry = await this.inquiryRepository.save({
      title: creator.title,
      contents: creator.contents,
      email: creator.email,
    });

    return inquiry.id;
  }
}
