import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// 발송 시도/제외 결과를 수신자별로 기록한다.
//  - sent: 발송 성공
//  - failed: 발송 시도했으나 실패 (SES 오류 등)
//  - excluded: 발송 전 검증에서 제외 (형식 오류 / MX 없음 / 존재하지 않는 메일함)
export type OnchurchEmailRecipientStatus = 'sent' | 'failed' | 'excluded';

export type OnchurchEmailRecipientResult = {
  email: string;
  status: OnchurchEmailRecipientStatus;
  reason: string | null;
};

// 발송 작업 전체의 진행 상태 (큐 기반 비동기 발송)
//  - queued: 큐 적재 완료(발송 시작 전) / processing: 발송 중 / completed: 발송 종료
export type OnchurchEmailLogStatus = 'queued' | 'processing' | 'completed';

@Entity('onchurch_email_logs')
export class OnchurchEmailLog extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'sender_id' })
  senderId: number;

  @Column({ type: 'varchar', name: 'sender_name' })
  senderName: string;

  @Column({ type: 'varchar', name: 'subject' })
  subject: string;

  @Column({ type: 'text', name: 'content' })
  content: string;

  @Column({ type: 'jsonb', name: 'results' })
  results: OnchurchEmailRecipientResult[];

  @Column({ type: 'int', name: 'total' })
  total: number;

  @Column({ type: 'int', name: 'sent' })
  sent: number;

  @Column({ type: 'int', name: 'failed' })
  failed: number;

  @Column({ type: 'int', name: 'excluded' })
  excluded: number;

  @Column({ type: 'varchar', name: 'status', default: 'completed' })
  status: OnchurchEmailLogStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
