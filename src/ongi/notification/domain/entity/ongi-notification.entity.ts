import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** 앱 내 알림 목록 한 줄 — 푸시를 보낼 때 수신자마다 남긴다 (푸시 설정과 무관). 30일 뒤 삭제 */
@Entity('ongi_notifications')
@Index('idx_ongi_notifications_user_created', ['userId', 'createdAt'])
export class OngiNotification extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', name: 'type', length: 32 })
  type: string;

  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @Column({ type: 'text', name: 'body' })
  body: string;

  @Column({ type: 'jsonb', name: 'data', default: () => "'{}'" })
  data: Record<string, string>;

  @Column({ type: 'int', name: 'actor_user_id', nullable: true })
  actorUserId: number | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
