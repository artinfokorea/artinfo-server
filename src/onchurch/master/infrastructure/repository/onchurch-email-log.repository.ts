import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchEmailLogRepository } from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import { OnchurchEmailLog, OnchurchEmailRecipientResult } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';
import { PagingItems } from '@/common/type/type';

// status별로 증가시킬 카운터 컬럼. (SQL에 그대로 보간하므로 화이트리스트로만 매핑)
const STATUS_COLUMN: Record<OnchurchEmailRecipientResult['status'], 'sent' | 'failed' | 'excluded'> = {
  sent: 'sent',
  failed: 'failed',
  excluded: 'excluded',
};

@Injectable()
export class OnchurchEmailLogRepository implements IOnchurchEmailLogRepository {
  constructor(
    @InjectRepository(OnchurchEmailLog)
    private readonly emailLogRepository: Repository<OnchurchEmailLog>,
  ) {}

  async createPending(params: {
    senderId: number;
    senderName: string;
    subject: string;
    content: string;
    total: number;
  }): Promise<number> {
    const log = await this.emailLogRepository.save({
      ...params,
      results: [],
      sent: 0,
      failed: 0,
      excluded: 0,
      status: 'processing',
    });
    return log.id;
  }

  async recordResult(id: number, result: OnchurchEmailRecipientResult): Promise<{ completed: boolean }> {
    const column = STATUS_COLUMN[result.status];
    // 동시에 도는 여러 워커가 같은 로그 행을 갱신하므로 행 단위 원자적 UPDATE로 카운터 증가 + results append.
    // 증가 후 sent+failed+excluded >= total 이면 completed로 전환한다.
    const rows = await this.emailLogRepository.query(
      `UPDATE onchurch_email_logs
          SET ${column} = ${column} + 1,
              results = results || $1::jsonb,
              status = CASE WHEN (sent + failed + excluded + 1) >= total THEN 'completed' ELSE status END
        WHERE id = $2
      RETURNING (sent + failed + excluded >= total) AS completed`,
      [JSON.stringify([result]), id],
    );
    return { completed: rows?.[0]?.completed === true };
  }

  async findById(id: number): Promise<OnchurchEmailLog | null> {
    return this.emailLogRepository.findOne({ where: { id } });
  }

  async findPage(params: { keyword: string | null; page: number; size: number }): Promise<PagingItems<OnchurchEmailLog>> {
    const qb = this.emailLogRepository.createQueryBuilder('log').orderBy('log.id', 'DESC');

    const keyword = params.keyword?.trim();
    if (keyword) {
      // 제목·본문·수신자(results jsonb를 ::text로 캐스팅해 이메일 부분 일치) 검색
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
