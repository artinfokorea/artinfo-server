import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_churches')
export class OnchurchChurch extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'owner_id', unique: true })
  ownerId: number;

  @Column({ type: 'varchar', name: 'slug', unique: true })
  slug: string;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'eng', nullable: true })
  eng: string | null;

  @Column({ type: 'varchar', name: 'tagline', nullable: true })
  tagline: string | null;

  @Column({ type: 'varchar', name: 'phone', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', name: 'email', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', name: 'address', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', name: 'representative', nullable: true })
  representative: string | null;

  @Column({ type: 'varchar', name: 'business_no', nullable: true })
  businessNo: string | null;

  @Column({ type: 'varchar', name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', name: 'youtube_url', nullable: true })
  youtubeUrl: string | null;

  @Column({ type: 'jsonb', name: 'enabled_pages', default: () => "'[]'::jsonb" })
  enabledPages: string[];

  @Column({ type: 'jsonb', name: 'home_section_order', default: () => "'[]'::jsonb" })
  homeSectionOrder: string[];

  @Column({ type: 'boolean', name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', name: 'first_published_at', nullable: true })
  firstPublishedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
