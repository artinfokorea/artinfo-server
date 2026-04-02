import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AZEYO_NOTIFICATION_TYPE {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  SCHEDULE = 'SCHEDULE',
  JOKBO_COPY = 'JOKBO_COPY',
  SYSTEM = 'SYSTEM',
}

export enum AZEYO_NOTIFICATION_CHANNEL {
  IN_APP = 'IN_APP',
  KAKAO_ALIMTALK = 'KAKAO_ALIMTALK',
}

@Entity('azeyo_notifications')
export class AzeyoNotification extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'enum', enum: AZEYO_NOTIFICATION_TYPE, name: 'type' })
  type: AZEYO_NOTIFICATION_TYPE;

  @Column({ name: 'title' })
  title: string;

  @Column({ type: 'text', name: 'body' })
  body: string;

  @Column({ type: 'varchar', name: 'reference_id', nullable: true })
  referenceId: string | null;

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
