import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface OnchurchBulletinWorshipOrderItem {
  no: string;
  item: string;
  leader: string | null;
}

export interface OnchurchBulletinWorshipServiceItem {
  name: string;
  time: string;
  meta: string | null;
}

export interface OnchurchBulletinStaffItem {
  name: string;
  role: string | null;
  area: string | null;
}

export interface OnchurchBulletinNewsItem {
  title: string;
  content: string | null;
}

export interface OnchurchBulletinVolunteerItem {
  key: string;
  value: string;
}

@Entity('onchurch_bulletins')
export class OnchurchBulletin extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id', unique: true })
  churchId: number;

  // 템플릿 식별자 (현재 기본 1종: 'classic')
  @Column({ type: 'varchar', name: 'template_id', length: 32, default: 'classic' })
  templateId: string;

  // 사용 날짜 — 자유 입력 (예: '2026-05-31' 또는 '2026년 5월 31일 주일')
  @Column({ type: 'varchar', name: 'service_date', nullable: true, length: 120 })
  serviceDate: string | null;

  // 교회 위치 이미지 (지도 캡처 등) 업로드 URL
  @Column({ type: 'varchar', name: 'location_image_url', nullable: true, length: 1000 })
  locationImageUrl: string | null;

  @Column({ type: 'jsonb', name: 'worship_order', default: () => "'[]'::jsonb" })
  worshipOrder: OnchurchBulletinWorshipOrderItem[];

  @Column({ type: 'jsonb', name: 'worship_services', default: () => "'[]'::jsonb" })
  worshipServices: OnchurchBulletinWorshipServiceItem[];

  @Column({ type: 'jsonb', name: 'staff', default: () => "'[]'::jsonb" })
  staff: OnchurchBulletinStaffItem[];

  @Column({ type: 'jsonb', name: 'news', default: () => "'[]'::jsonb" })
  news: OnchurchBulletinNewsItem[];

  @Column({ type: 'jsonb', name: 'volunteers', default: () => "'[]'::jsonb" })
  volunteers: OnchurchBulletinVolunteerItem[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
