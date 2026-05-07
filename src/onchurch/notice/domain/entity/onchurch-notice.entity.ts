import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_notices')
export class OnchurchNotice extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'varchar', name: 'category', nullable: true, length: 50 })
  category: string | null;

  @Column({ type: 'varchar', name: 'title', length: 300 })
  title: string;

  @Column({ type: 'text', name: 'content', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', name: 'author', nullable: true, length: 80 })
  author: string | null;

  @Column({ type: 'boolean', name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', name: 'published_at', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
