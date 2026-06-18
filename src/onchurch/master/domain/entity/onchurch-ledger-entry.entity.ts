import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// 서비스 운영 가계부 항목.
//  - income: 수입 (구독료·광고 등 들어온 돈)
//  - expense: 지출 (서버비·환불 등 나간 돈)
export type OnchurchLedgerType = 'income' | 'expense';

@Entity('onchurch_ledger_entries')
export class OnchurchLedgerEntry extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  // 거래 일자 (YYYY-MM-DD). 시간은 다루지 않는다.
  @Column({ type: 'date', name: 'entry_date' })
  entryDate: string;

  @Column({ type: 'varchar', name: 'type' })
  type: OnchurchLedgerType;

  // 금액(원). 수입/지출 모두 양수로 저장하고 type으로 구분한다.
  @Column({ type: 'int', name: 'amount' })
  amount: number;

  // "어떻게" — 수입/지출의 항목·수단 (예: 구독료, AWS 서버비, 환불)
  @Column({ type: 'varchar', name: 'category' })
  category: string;

  @Column({ type: 'text', name: 'memo', nullable: true })
  memo: string | null;

  @Column({ type: 'int', name: 'created_by' })
  createdBy: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
