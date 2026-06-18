import { ApiProperty } from '@nestjs/swagger';
import { OnchurchLedgerEntry, OnchurchLedgerType } from '@/onchurch/master/domain/entity/onchurch-ledger-entry.entity';
import { OnchurchLedgerSummary } from '@/onchurch/master/domain/repository/onchurch-ledger.repository.interface';

export class OnchurchLedgerEntryResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, description: '거래 일자 (YYYY-MM-DD)' }) entryDate: string;
  @ApiProperty({ type: String, enum: ['income', 'expense'], description: '수입/지출' }) type: OnchurchLedgerType;
  @ApiProperty({ type: Number, description: '금액(원)' }) amount: number;
  @ApiProperty({ type: String, description: '항목·수단' }) category: string;
  @ApiProperty({ type: String, nullable: true, description: '메모' }) memo: string | null;
  @ApiProperty({ type: String, description: '등록 일시 (ISO)' }) createdAt: string;

  constructor(entry: OnchurchLedgerEntry) {
    this.id = entry.id;
    this.entryDate = entry.entryDate;
    this.type = entry.type;
    this.amount = entry.amount;
    this.category = entry.category;
    this.memo = entry.memo;
    this.createdAt = entry.createdAt.toISOString();
  }
}

export class OnchurchLedgerListResponse {
  @ApiProperty({ type: [OnchurchLedgerEntryResponse] }) items: OnchurchLedgerEntryResponse[];
  @ApiProperty({ type: Number, description: '조회 조건에 해당하는 전체 건수' }) totalCount: number;
  @ApiProperty({ type: Number, description: '수입 합계(원)' }) totalIncome: number;
  @ApiProperty({ type: Number, description: '지출 합계(원)' }) totalExpense: number;
  @ApiProperty({ type: Number, description: '잔액 (수입 - 지출)' }) balance: number;

  constructor(params: { items: OnchurchLedgerEntry[]; totalCount: number; summary: OnchurchLedgerSummary }) {
    this.items = params.items.map((e) => new OnchurchLedgerEntryResponse(e));
    this.totalCount = params.totalCount;
    this.totalIncome = params.summary.totalIncome;
    this.totalExpense = params.summary.totalExpense;
    this.balance = params.summary.totalIncome - params.summary.totalExpense;
  }
}
