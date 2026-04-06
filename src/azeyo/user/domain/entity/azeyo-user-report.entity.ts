import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

export enum AZEYO_USER_REPORT_REASON {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  HARASSMENT = 'HARASSMENT',
  IMPERSONATION = 'IMPERSONATION',
  OTHER = 'OTHER',
}

@Entity('azeyo_user_reports')
export class AzeyoUserReport extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'reporter_id' })
  reporterId: number;

  @ManyToOne(() => AzeyoUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_id', referencedColumnName: 'id' })
  target: AzeyoUser;

  @Column({ name: 'target_id' })
  targetId: number;

  @Column({ type: 'varchar', name: 'reason' })
  reason: AZEYO_USER_REPORT_REASON;

  @Column({ type: 'varchar', name: 'contents', nullable: true })
  contents: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
