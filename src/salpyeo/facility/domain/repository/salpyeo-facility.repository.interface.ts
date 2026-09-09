import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';

export const SALPYEO_FACILITY_REPOSITORY = Symbol('SALPYEO_FACILITY_REPOSITORY');

/** 관리자가 고칠 수 있는 필드 — slug·vertical 과 아직 연동 전인 값(거리·평점·후기)은 제외한다 */
export interface SalpyeoFacilityPatch {
  name?: string;
  meta?: string;
  sido?: string;
  sigungu?: string;
  operatorType?: string;
  address?: string;
  phone?: string;
  website?: string;
  inspectionBadge?: string;
  featureBadge?: string;
  price?: number;
  priceRows?: SalpyeoFacility['priceRows'];
  images?: SalpyeoFacility['images'];
  isActive?: boolean;
}

export interface ISalpyeoFacilityRepository {
  /** 버티컬의 활성 시설 전체 (sort_order ASC) */
  findByVertical(vertical: SalpyeoVerticalKey): Promise<SalpyeoFacility[]>;
  findBySlug(slug: string): Promise<SalpyeoFacility | null>;
  /** 버티컬별 활성 시설 수 — 버티컬 목록 응답의 count 에 사용 */
  countByVertical(): Promise<Record<SalpyeoVerticalKey, number>>;

  /** 관리자용 — 노출을 내린(is_active=false) 시설도 포함한다 */
  findByVerticalForAdmin(vertical: SalpyeoVerticalKey): Promise<SalpyeoFacility[]>;
  findBySlugForAdmin(slug: string): Promise<SalpyeoFacility | null>;
  /** 보낸 필드만 갱신하고 갱신된 시설을 돌려준다 */
  update(slug: string, patch: SalpyeoFacilityPatch): Promise<SalpyeoFacility>;
}
