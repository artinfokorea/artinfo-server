import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchEmailLogRepository } from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import { OnchurchEmailFailure, OnchurchEmailLog } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';
import { PagingItems } from '@/common/type/type';

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

  async findPage(params: { keyword: string | null; page: number; size: number }): Promise<PagingItems<OnchurchEmailLog>> {
    const qb = this.emailLogRepository.createQueryBuilder('log').orderBy('log.id', 'DESC');

    const keyword = params.keyword?.trim();
    if (keyword) {
      // 제목·본문·수신자(jsonb 배열은 ::text로 캐스팅해 부분 일치) 검색
      qb.andWhere('(log.subject ILIKE :kw OR log.content ILIKE :kw OR log.recipients::text ILIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }

    const [items, totalCount] = await qb
      .skip((params.page - 1) * params.size)
      .take(params.size)
      .getManyAndCount();

    return { items, totalCount };
  }
}
