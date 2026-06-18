import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchLedgerRepository,
  OnchurchLedgerSummary,
} from '@/onchurch/master/domain/repository/onchurch-ledger.repository.interface';
import { OnchurchLedgerEntry, OnchurchLedgerType } from '@/onchurch/master/domain/entity/onchurch-ledger-entry.entity';
import { PagingItems } from '@/common/type/type';

@Injectable()
export class OnchurchLedgerRepository implements IOnchurchLedgerRepository {
  constructor(
    @InjectRepository(OnchurchLedgerEntry)
    private readonly ledgerRepository: Repository<OnchurchLedgerEntry>,
  ) {}

  async create(params: {
    entryDate: string;
    type: OnchurchLedgerType;
    amount: number;
    category: string;
    memo: string | null;
    createdBy: number;
  }): Promise<number> {
    const entry = await this.ledgerRepository.save(params);
    return entry.id;
  }

  async findById(id: number): Promise<OnchurchLedgerEntry | null> {
    return this.ledgerRepository.findOneBy({ id });
  }

  async findPage(params: { month: string | null; page: number; size: number }): Promise<PagingItems<OnchurchLedgerEntry>> {
    const qb = this.ledgerRepository
      .createQueryBuilder('entry')
      .orderBy('entry.entry_date', 'DESC')
      .addOrderBy('entry.id', 'DESC');

    if (params.month) {
      qb.andWhere("to_char(entry.entry_date, 'YYYY-MM') = :month", { month: params.month });
    }

    const [items, totalCount] = await qb
      .skip((params.page - 1) * params.size)
      .take(params.size)
      .getManyAndCount();

    return { items, totalCount };
  }

  async summary(params: { month: string | null }): Promise<OnchurchLedgerSummary> {
    const qb = this.ledgerRepository
      .createQueryBuilder('entry')
      .select('entry.type', 'type')
      .addSelect('SUM(entry.amount)', 'sum')
      .groupBy('entry.type');

    if (params.month) {
      qb.andWhere("to_char(entry.entry_date, 'YYYY-MM') = :month", { month: params.month });
    }

    const rows = await qb.getRawMany<{ type: OnchurchLedgerType; sum: string }>();

    let totalIncome = 0;
    let totalExpense = 0;
    for (const row of rows) {
      if (row.type === 'income') totalIncome = Number(row.sum) || 0;
      else if (row.type === 'expense') totalExpense = Number(row.sum) || 0;
    }
    return { totalIncome, totalExpense };
  }

  async deleteById(id: number): Promise<void> {
    await this.ledgerRepository.delete({ id });
  }
}
