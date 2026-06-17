import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type OnchurchEmailFailure = { email: string; reason: string };

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

  @Column({ type: 'jsonb', name: 'recipients' })
  recipients: string[];

  @Column({ type: 'int', name: 'total' })
  total: number;

  @Column({ type: 'int', name: 'sent' })
  sent: number;

  @Column({ type: 'int', name: 'failed' })
  failed: number;

  @Column({ type: 'jsonb', name: 'failures' })
  failures: OnchurchEmailFailure[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
