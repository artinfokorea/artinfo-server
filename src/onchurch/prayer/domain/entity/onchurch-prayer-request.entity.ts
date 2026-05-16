import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type OnchurchPrayerStatus = 'pending' | 'praying' | 'answered';

@Entity('onchurch_prayer_requests')
export class OnchurchPrayerRequest extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'varchar', name: 'name', nullable: true, length: 80 })
  name: string | null;

  @Column({ type: 'varchar', name: 'contact', nullable: true, length: 200 })
  contact: string | null;

  @Column({ type: 'varchar', name: 'category', length: 50 })
  category: string;

  @Column({ type: 'varchar', name: 'scope', length: 50 })
  scope: string;

  @Column({ type: 'text', name: 'content' })
  content: string;

  @Column({ type: 'boolean', name: 'is_anonymous', default: false })
  isAnonymous: boolean;

  @Column({ type: 'varchar', name: 'status', length: 20, default: 'pending' })
  status: OnchurchPrayerStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
