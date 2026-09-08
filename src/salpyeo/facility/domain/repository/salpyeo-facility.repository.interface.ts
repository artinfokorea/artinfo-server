import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';

export const SALPYEO_FACILITY_REPOSITORY = Symbol('SALPYEO_FACILITY_REPOSITORY');

export interface ISalpyeoFacilityRepository {
  /** 버티컬의 활성 시설 전체 (sort_order ASC) */
  findByVertical(vertical: SalpyeoVerticalKey): Promise<SalpyeoFacility[]>;
  findBySlug(slug: string): Promise<SalpyeoFacility | null>;
  /** 버티컬별 활성 시설 수 — 버티컬 목록 응답의 count 에 사용 */
  countByVertical(): Promise<Record<SalpyeoVerticalKey, number>>;
}
