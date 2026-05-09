import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_galleries')
export class OnchurchGallery extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'int', name: 'category_id', nullable: true })
  categoryId: number | null;

  @Column({ type: 'varchar', name: 'title', length: 200 })
  title: string;

  @Column({ type: 'varchar', name: 'date', nullable: true, length: 40 })
  date: string | null;

  @Column({ type: 'varchar', name: 'photo_url', nullable: true, length: 500 })
  photoUrl: string | null;

  @Column({ type: 'varchar', name: 'grad', nullable: true, length: 32 })
  grad: string | null;

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
