import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchInquiryRepository } from '@/onchurch/inquiry/domain/repository/onchurch-inquiry.repository.interface';
import { OnchurchInquiry } from '@/onchurch/inquiry/domain/entity/onchurch-inquiry.entity';

@Injectable()
export class OnchurchInquiryRepository implements IOnchurchInquiryRepository {
  constructor(
    @InjectRepository(OnchurchInquiry)
    private readonly inquiryRepository: Repository<OnchurchInquiry>,
  ) {}

  async create(userId: number, question: string): Promise<OnchurchInquiry> {
    return this.inquiryRepository.save({ userId, question });
  }

  async findAllByUserId(userId: number): Promise<OnchurchInquiry[]> {
    return this.inquiryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }
}
