import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchSmsLogRepository } from '@/onchurch/master/domain/repository/onchurch-sms-log.repository.interface';
import { OnchurchSmsLog, OnchurchSmsRecipientResult } from '@/onchurch/master/domain/entity/onchurch-sms-log.entity';
import { PagingItems } from '@/common/type/type';

@Injectable()
export class OnchurchSmsLogRepository implements IOnchurchSmsLogRepository {
  constructor(
    @InjectRepository(OnchurchSmsLog)
    private readonly smsLogRepository: Repository<OnchurchSmsLog>,
  ) {}

  async create(params: {
    senderId: number;
    senderName: string;
    subject: string;
    content: string;
    results: OnchurchSmsRecipientResult[];
    total: number;
    sent: number;
    failed: number;
    excluded: number;
  }): Promise<number> {
    const log = await this.smsLogRepository.save(params);
    return log.id;
  }

  async findPage(params: { keyword: string | null; page: number; size: number }): Promise<PagingItems<OnchurchSmsLog>> {
    const qb = this.smsLogRepository.createQueryBuilder('log').orderBy('log.id', 'DESC');

    const keyword = params.keyword?.trim();
    if (keyword) {
      // 제목·본문·수신자(results jsonb를 ::text로 캐스팅해 번호 부분 일치) 검색
      qb.andWhere('(log.subject ILIKE :kw OR log.content ILIKE :kw OR log.results::text ILIKE :kw)', {
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
