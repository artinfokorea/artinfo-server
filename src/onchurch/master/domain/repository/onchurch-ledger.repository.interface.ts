import { OnchurchLedgerEntry, OnchurchLedgerType } from '@/onchurch/master/domain/entity/onchurch-ledger-entry.entity';
import { PagingItems } from '@/common/type/type';

export const ONCHURCH_LEDGER_REPOSITORY = Symbol('ONCHURCH_LEDGER_REPOSITORY');

export type OnchurchLedgerSummary = {
  totalIncome: number;
  totalExpense: number;
};

export interface IOnchurchLedgerRepository {
  create(params: {
    entryDate: string;
    type: OnchurchLedgerType;
    amount: number;
    category: string;
    memo: string | null;
    createdBy: number;
  }): Promise<number>;
  findById(id: number): Promise<OnchurchLedgerEntry | null>;
  findPage(params: { month: string | null; page: number; size: number }): Promise<PagingItems<OnchurchLedgerEntry>>;
  summary(params: { month: string | null }): Promise<OnchurchLedgerSummary>;
  deleteById(id: number): Promise<void>;
}
