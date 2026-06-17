import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchEmailLogRepository } from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import { OnchurchEmailFailure, OnchurchEmailLog } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';

@Injectable()
export class OnchurchEmailLogRepository implements IOnchurchEmailLogRepository {
  constructor(
    @InjectRepository(OnchurchEmailLog)
    private readonly emailLogRepository: Repository<OnchurchEmailLog>,
  ) {}

  async create(params: {
    senderId: number;
    senderName: string;
    subject: string;
    content: string;
    recipients: string[];
    total: number;
    sent: number;
    failed: number;
    failures: OnchurchEmailFailure[];
  }): Promise<number> {
    const log = await this.emailLogRepository.save(params);
    return log.id;
  }

  async findAll(): Promise<OnchurchEmailLog[]> {
    return this.emailLogRepository.find({
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }
}
