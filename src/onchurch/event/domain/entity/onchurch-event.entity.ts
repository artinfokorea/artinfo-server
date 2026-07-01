import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_events')
export class OnchurchEvent extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'varchar', name: 'title', length: 300 })
  title: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', name: 'location', nullable: true, length: 200 })
  location: string | null;

  @Column({ type: 'timestamp', name: 'start_at' })
  startAt: Date;

  @Column({ type: 'timestamp', name: 'end_at', nullable: true })
  endAt: Date | null;

  @Column({ type: 'boolean', name: 'is_all_day', default: false })
  isAllDay: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
