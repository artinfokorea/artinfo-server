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

  // 유튜브 채널 라이브 임베드용으로 youtubeUrl에서 1회 해석한 채널ID(UC...). 해석 실패 시 null.
  @Column({ type: 'varchar', name: 'live_channel_id', nullable: true })
  liveChannelId: string | null;

  // 관리자가 켠 '실시간 방송' 상태. 켠 시각으로부터 일정 시간 경과 시 표시 단계에서 자동 종료 처리.
  @Column({ type: 'boolean', name: 'is_live', default: false })
  isLive: boolean;

  @Column({ type: 'timestamp', name: 'live_started_at', nullable: true })
  liveStartedAt: Date | null;

  @Column({ type: 'jsonb', name: 'enabled_pages', default: () => "'[]'::jsonb" })
  enabledPages: string[];

  @Column({ type: 'jsonb', name: 'home_section_order', default: () => "'[]'::jsonb" })
  homeSectionOrder: string[];

  @Column({ type: 'int', name: 'sort_order', nullable: true })
  sortOrder: number | null;

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
