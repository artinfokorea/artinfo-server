import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// 공개 범위: 전체공개(public) | 회원공개(member). 회원공개 페이지의 본문은 해당 교회 소속 로그인 사용자에게만 내려준다.
export enum ONCHURCH_CUSTOM_PAGE_VISIBILITY {
  PUBLIC = 'public',
  MEMBER = 'member',
}

// 커스텀 페이지 본문은 '블록 배열'로 저장한다. HTML을 저장하지 않으므로 렌더 시 sanitize가 필요 없고,
// 블록 타입이 늘어나도 기존 데이터가 깨지지 않는다. 지원 타입/옵션의 단일 소스는 프론트다.
export type OnchurchCustomPageBlock = {
  // 'heading' | 'text' | 'image' | 'video' | 'button' | 'divider'
  type: string;
  // 타입별 속성(text, url, caption, width, level, href, label ...). 서버는 내용을 해석하지 않는다.
  [key: string]: unknown;
};

@Entity('onchurch_custom_pages')
export class OnchurchCustomPage extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  // 공개 URL 경로(/p/:slug)에 쓰이는 값. 교회 안에서 유일하다.
  @Column({ type: 'varchar', name: 'slug', length: 80 })
  slug: string;

  // 네비게이션에 노출되는 페이지 이름.
  @Column({ type: 'varchar', name: 'title', length: 100 })
  title: string;

  // 페이지 제목 아래에 들어가는 한 줄 설명. 고정 페이지들의 안내 문구와 같은 자리다.
  @Column({ type: 'varchar', name: 'summary', length: 200, nullable: true })
  summary: string | null;

  @Column({ type: 'jsonb', name: 'blocks', default: () => "'[]'::jsonb" })
  blocks: OnchurchCustomPageBlock[];

  // 네비게이션 노출 순서(작을수록 앞). 커스텀 페이지들끼리의 상대 순서다.
  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  // false면 공개 사이트에서 감춘다(네비·직접 접근 모두).
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  // 공개 범위. 회원공개면 네비에는 보이되 본문은 교인 로그인 후에만 열린다.
  @Column({ type: 'varchar', name: 'visibility', length: 16, default: ONCHURCH_CUSTOM_PAGE_VISIBILITY.PUBLIC })
  visibility: ONCHURCH_CUSTOM_PAGE_VISIBILITY;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
