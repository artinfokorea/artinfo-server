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

  @Column({ type: 'varchar', name: 'instagram_url', nullable: true })
  instagramUrl: string | null;

  @Column({ type: 'varchar', name: 'naver_verification', nullable: true })
  naverVerification: string | null;

  // 관리자가 등록하는 라이브 영상 URL(watch?v=...). 켤 때 이 영상으로 임베드한다.
  @Column({ type: 'varchar', name: 'live_url', nullable: true })
  liveUrl: string | null;

  // 관리자가 켠 '실시간 방송' 상태. 켠 시각으로부터 일정 시간 경과 시 표시 단계에서 자동 종료 처리.
  @Column({ type: 'boolean', name: 'is_live', default: false })
  isLive: boolean;

  @Column({ type: 'timestamp', name: 'live_started_at', nullable: true })
  liveStartedAt: Date | null;

  @Column({ type: 'jsonb', name: 'enabled_pages', default: () => "'[]'::jsonb" })
  enabledPages: string[];

  @Column({ type: 'jsonb', name: 'home_section_order', default: () => "'[]'::jsonb" })
  homeSectionOrder: string[];

  // 홈 '바로가기'에 노출할 항목 키 배열(순서 포함). 비어 있으면 기본 항목을 노출한다.
  @Column({ type: 'jsonb', name: 'home_quick_links', default: () => "'[]'::jsonb" })
  homeQuickLinks: string[];

  // 공개 사이트 고정 UI 문구 언어. 'ko' | 'en'. 교회 입력 콘텐츠는 이 값과 무관하게 원문 유지.
  @Column({ type: 'varchar', name: 'site_lang', default: () => "'ko'" })
  siteLang: string;

  // 공개 홈페이지 렌더링 템플릿. 'default'(기본 모던) | 'classic'(충현교회 스타일 전통형).
  // 값 지정은 운영자가 DB에서 직접 변경한다(관리자 UI/일반 저장 경로에서는 건드리지 않음).
  @Column({ type: 'varchar', name: 'site_template', default: () => "'default'" })
  siteTemplate: string;

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
