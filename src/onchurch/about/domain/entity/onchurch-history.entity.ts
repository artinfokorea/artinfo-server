import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_histories')
export class OnchurchHistory extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'varchar', name: 'year', length: 16 })
  year: string;

  @Column({ type: 'varchar', name: 'title', length: 200 })
  title: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
