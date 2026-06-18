import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// 문자 발송 시도/제외 결과를 수신자별로 기록한다.
//  - sent: 발송 성공
//  - failed: 발송 시도했으나 실패 (CoolSMS 오류 등)
//  - excluded: 발송 전 검증에서 제외 (번호 형식 오류 등)
export type OnchurchSmsRecipientStatus = 'sent' | 'failed' | 'excluded';

export type OnchurchSmsRecipientResult = {
  phone: string;
  status: OnchurchSmsRecipientStatus;
  reason: string | null;
};

@Entity('onchurch_sms_logs')
export class OnchurchSmsLog extends BaseEntity {
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
  results: OnchurchSmsRecipientResult[];

  @Column({ type: 'int', name: 'total' })
  total: number;

  @Column({ type: 'int', name: 'sent' })
  sent: number;

  @Column({ type: 'int', name: 'failed' })
  failed: number;

  @Column({ type: 'int', name: 'excluded' })
  excluded: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
