import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';

export interface SalpyeoFacilityImage {
  url: string;
  /** 캡션 겸 대체 텍스트 (예: 신생아실) */
  alt: string;
  width: number;
  height: number;
}

export interface SalpyeoPriceRow {
  room: string;
  note: string;
  /** 표시용 문자열 — "0원", "무료" 같은 예외 케이스 포함 */
  price: string;
}

export interface SalpyeoInspection {
  title: string;
  /** 기관 · 날짜 (예: 분당구보건소 · 2026.05) */
  date: string;
  result: string;
}

export interface SalpyeoReview {
  meta: string;
  text: string;
}

/**
 * 살펴 시설 — 5개 버티컬 공통 스키마.
 * 요금표·점검·사진처럼 버티컬마다 항목 수가 다른 값은 JSONB 로 보관한다.
 */
@Entity('salpyeo_facilities')
@Index('idx_salpyeo_facilities_vertical_active', ['vertical', 'isActive'])
export class SalpyeoFacility extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** URL 에 쓰는 공개 식별자 (예: p1) */
  @Column({ type: 'varchar', length: 40, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 16 })
  vertical: SalpyeoVerticalKey;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** 위치 요약 (예: 정자역 도보 6분) */
  @Column({ type: 'varchar', length: 200 })
  meta: string;

  @Column({ type: 'varchar', length: 40, name: 'distance_label' })
  distanceLabel: string;

  @Column({ type: 'int', name: 'distance_minutes' })
  distanceMinutes: number;

  /** 점검·평가 배지 (초록) */
  @Column({ type: 'varchar', length: 60, name: 'inspection_badge' })
  inspectionBadge: string;

  /** 특성 배지 (파랑) */
  @Column({ type: 'varchar', length: 60, name: 'feature_badge' })
  featureBadge: string;

  /** 대표 가격 (원) */
  @Column({ type: 'int' })
  price: number;

  /** 평점 0.0 ~ 5.0 — numeric 은 문자열로 돌아오므로 transformer 로 숫자화 */
  @Column({ type: 'numeric', precision: 2, scale: 1, transformer: { to: (v: number) => v, from: (v: string | number) => Number(v) } })
  rating: number;

  @Column({ type: 'int', name: 'review_count', default: 0 })
  reviewCount: number;

  /** 지역 평균 대비 %. 음수 = 저렴, 양수 = 비쌈, 0 = 평균 수준 */
  @Column({ type: 'int', name: 'vs_avg_percent', default: 0 })
  vsAvgPercent: number;

  @Column({ type: 'jsonb', default: () => `'[]'` })
  images: SalpyeoFacilityImage[];

  @Column({ type: 'jsonb', name: 'price_rows', default: () => `'[]'` })
  priceRows: SalpyeoPriceRow[];

  @Column({ type: 'jsonb', default: () => `'[]'` })
  inspections: SalpyeoInspection[];

  @Column({ type: 'jsonb', nullable: true })
  review: SalpyeoReview | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
