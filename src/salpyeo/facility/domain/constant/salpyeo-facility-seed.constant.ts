import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SALPYEO_POST_FACILITY_RECORDS } from '@/salpyeo/facility/domain/constant/salpyeo-post-facility-data.constant';
import { buildPostFacilitySeed } from '@/salpyeo/facility/domain/service/salpyeo-post-facility-seed';

/** 시드에 필요한 필드만 — id/타임스탬프/isActive 는 DB 가 채운다 */
export type SalpyeoFacilitySeed = Pick<
  SalpyeoFacility,
  | 'slug'
  | 'vertical'
  | 'name'
  | 'meta'
  | 'sido'
  | 'sigungu'
  | 'operatorType'
  | 'address'
  | 'phone'
  | 'distanceLabel'
  | 'distanceMinutes'
  | 'inspectionBadge'
  | 'featureBadge'
  | 'price'
  | 'rating'
  | 'reviewCount'
  | 'vsAvgPercent'
  | 'images'
  | 'priceRows'
  | 'inspections'
  | 'review'
  | 'sortOrder'
>;

/**
 * 시설 시드 = 공공데이터 그대로. 현재는 산후조리원(보건복지부 전국 산후조리원 현황 2023-12-31) 456건.
 * 기동 시 SalpyeoSchemaBootstrapService 가 slug 기준 upsert 하고, 시드에 없는 행은 지운다 (시드가 유일한 원천인 동안).
 * 다른 버티컬(요양원·장례식장·어린이집·학원)은 데이터 연동 전이라 비어 있다.
 */
export const SALPYEO_FACILITY_SEED: readonly SalpyeoFacilitySeed[] = buildPostFacilitySeed(SALPYEO_POST_FACILITY_RECORDS);
