import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_sermons')
export class OnchurchSermon extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'int', name: 'series_id', nullable: true })
  seriesId: number | null;

  @Column({ type: 'varchar', name: 'title', length: 200 })
  title: string;

  @Column({ type: 'varchar', name: 'pastor', nullable: true, length: 120 })
  pastor: string | null;

  @Column({ type: 'varchar', name: 'date', nullable: true, length: 40 })
  date: string | null;

  @Column({ type: 'varchar', name: 'duration', nullable: true, length: 40 })
  duration: string | null;

  @Column({ type: 'varchar', name: 'video_url', nullable: true, length: 500 })
  videoUrl: string | null;

  @Column({ type: 'varchar', name: 'thumbnail_url', nullable: true, length: 500 })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', name: 'bulletin_url', nullable: true, length: 500 })
  bulletinUrl: string | null;

  @Column({ type: 'text', name: 'summary', nullable: true })
  summary: string | null;

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
