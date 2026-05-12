import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type OnchurchWorshipServiceTag = 'WEEK' | 'DAILY';

@Entity('onchurch_worship_services')
export class OnchurchWorshipService extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'varchar', name: 'tag', length: 16 })
  tag: OnchurchWorshipServiceTag;

  @Column({ type: 'varchar', name: 'name', length: 120 })
  name: string;

  @Column({ type: 'varchar', name: 'time', length: 80 })
  time: string;

  @Column({ type: 'varchar', name: 'meta', nullable: true, length: 200 })
  meta: string | null;

  @Column({ type: 'boolean', name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
