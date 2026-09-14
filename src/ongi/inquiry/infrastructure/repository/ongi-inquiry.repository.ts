import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOngiInquiryRepository } from '@/ongi/inquiry/domain/repository/ongi-inquiry.repository.interface';
import { OngiInquiry, OngiInquiryCreator } from '@/ongi/inquiry/domain/entity/ongi-inquiry.entity';

@Injectable()
export class OngiInquiryRepository implements IOngiInquiryRepository {
  constructor(
    @InjectRepository(OngiInquiry)
    private readonly inquiryRepository: Repository<OngiInquiry>,
  ) {}

  async create(creator: OngiInquiryCreator): Promise<OngiInquiry> {
    return this.inquiryRepository.save({ userId: creator.userId, content: creator.content });
  }

  async scanByUserId(userId: number): Promise<OngiInquiry[]> {
    return this.inquiryRepository.find({ where: { userId }, order: { createdAt: 'DESC', id: 'DESC' }, take: 100 });
  }
}
